import { getMarketCoins } from "@/services/coingecko";
import { NextResponse } from "next/server";

// Enhanced in-memory cache with better management
const marketCoinsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 120000; // 2 minutes
const STALE_CACHE_DURATION = 600000; // 10 minutes

// Pending requests to prevent duplicate calls
const pendingRequests = new Map<string, Promise<any>>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const per_page = Number(searchParams.get("per_page") || 20);

  // Create cache key
  const cacheKey = `${page}-${per_page}`;
  const now = Date.now();

  // Check fresh cache
  const cached = marketCoinsCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log(`[Market API] Fresh cache hit for page ${page}, per_page ${per_page}`);
    return Response.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        'X-Cache': 'HIT',
      }
    });
  }

  // Check if there's a pending request
  if (pendingRequests.has(cacheKey)) {
    console.log(`[Market API] Reusing pending request for ${cacheKey}`);
    const data = await pendingRequests.get(cacheKey);
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        'X-Cache': 'PENDING',
      }
    });
  }

  // Return stale cache while fetching in background
  if (cached && now - cached.timestamp < STALE_CACHE_DURATION) {
    console.log(`[Market API] Returning stale cache for page ${page}, refreshing in background`);
    
    // Fetch in background (don't await)
    const fetchPromise = getMarketCoins({ page, per_page })
      .then(data => {
        marketCoinsCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      })
      .catch(error => {
        console.error("[Market API] Background refresh error:", error);
      })
      .finally(() => {
        pendingRequests.delete(cacheKey);
      });
    
    pendingRequests.set(cacheKey, fetchPromise);
    
    return Response.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        'X-Cache': 'STALE',
      }
    });
  }

  // Fetch fresh data
  try {
    const fetchPromise = getMarketCoins({ page, per_page });
    pendingRequests.set(cacheKey, fetchPromise);
    
    const data = await fetchPromise;
    
    // Store in cache
    marketCoinsCache.set(cacheKey, { data, timestamp: now });
    
    console.log(`[Market API] Fetched ${data.length} coins for page ${page}, per_page ${per_page}`);
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      }
    });
  } catch (error) {
    console.error("[Market API] Error:", error);
    
    // If we have stale cache, use it
    if (cached) {
      console.log(`[Market API] Error occurred, using stale cache for page ${page}`);
      return Response.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=600',
          'X-Cache': 'ERROR-STALE',
        }
      });
    }
    
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  } finally {
    pendingRequests.delete(cacheKey);
  }
}
