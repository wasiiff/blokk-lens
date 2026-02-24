import { getMarketCoins } from "@/services/crypto-service";
import { NextResponse } from "next/server";

// Enhanced in-memory cache with better management
const marketCoinsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutes
const STALE_CACHE_DURATION = 900000; // 15 minutes
const MAX_CACHE_SIZE = 100; // Limit cache size to prevent memory issues

// Pending requests to prevent duplicate calls
const pendingRequests = new Map<string, Promise<any>>();

// Rate limiting
const requestTimestamps: number[] = [];
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute

// Clean up old cache entries
function cleanupCache() {
  if (marketCoinsCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(marketCoinsCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
    toDelete.forEach(([key]) => marketCoinsCache.delete(key));
    console.log(`[Market API] Cleaned up ${toDelete.length} old cache entries`);
  }
}

// Check rate limit
function checkRateLimit(): boolean {
  const now = Date.now();
  // Remove timestamps older than the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW) {
    requestTimestamps.shift();
  }
  
  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    console.warn(`[Market API] Rate limit exceeded: ${requestTimestamps.length} requests in last minute`);
    return false;
  }
  
  requestTimestamps.push(now);
  return true;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const per_page = Math.min(Number(searchParams.get("per_page") || 20), 250); // Cap at 250 (CoinGecko limit)

  // Validate inputs
  if (page < 1 || per_page < 1) {
    return NextResponse.json(
      { error: "Invalid page or per_page parameter" },
      { status: 400 }
    );
  }

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
    
    // Check rate limit before background fetch
    if (checkRateLimit()) {
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
    }
    
    return Response.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        'X-Cache': 'STALE',
      }
    });
  }

  // Check rate limit before fresh fetch
  if (!checkRateLimit()) {
    // If rate limited and we have any cache, return it
    if (cached) {
      console.log(`[Market API] Rate limited, returning stale cache for page ${page}`);
      return Response.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=600',
          'X-Cache': 'RATE-LIMITED',
        }
      });
    }
    
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again in a moment." },
      { status: 429 }
    );
  }

  // Fetch fresh data
  try {
    const fetchPromise = getMarketCoins({ page, per_page });
    pendingRequests.set(cacheKey, fetchPromise);
    
    const data = await fetchPromise;
    
    // Store in cache and cleanup if needed
    marketCoinsCache.set(cacheKey, { data, timestamp: now });
    cleanupCache();
    
    console.log(`[Market API] Fetched ${data.length} coins for page ${page}, per_page ${per_page}`);
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        'X-Cache': 'MISS',
        'X-Total-Loaded': data.length.toString(),
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
