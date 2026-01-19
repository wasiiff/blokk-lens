import { getMarketCoins } from "@/services/coingecko";
import { NextResponse } from "next/server";

// In-memory cache
let marketCoinsCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 minute cache

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const per_page = Number(searchParams.get("per_page") || 20);

  // Create cache key
  const cacheKey = `${page}-${per_page}`;
  const now = Date.now();

  // Check cache
  if (marketCoinsCache && now - marketCoinsCache.timestamp < CACHE_DURATION) {
    console.log(`[Market API] Cache hit for page ${page}`);
    return Response.json(marketCoinsCache.data);
  }

  try {
    const data = await getMarketCoins({ page, per_page });
    
    // Store in cache
    marketCoinsCache = { data, timestamp: now };
    
    return Response.json(data);
  } catch (error) {
    console.error("[Market API] Error:", error);
    
    // If we have stale cache, use it
    if (marketCoinsCache) {
      console.log(`[Market API] Error occurred, using stale cache`);
      return Response.json(marketCoinsCache.data);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
