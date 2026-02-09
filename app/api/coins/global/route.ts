import { NextResponse } from "next/server";
import { getGlobalData } from "@/services/crypto-service";

// Cache for global data
const globalCache = { data: null as any, timestamp: 0 };
const CACHE_DURATION = 60000; // 1 minute
const STALE_CACHE_DURATION = 300000; // 5 minutes

export async function GET() {
  const now = Date.now();

  // Check fresh cache
  if (globalCache.data && now - globalCache.timestamp < CACHE_DURATION) {
    return NextResponse.json(globalCache.data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const data = await getGlobalData();
    globalCache.data = data;
    globalCache.timestamp = now;

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error fetching global market data:", error);

    // Use stale cache
    if (globalCache.data && now - globalCache.timestamp < STALE_CACHE_DURATION) {
      return NextResponse.json(globalCache.data, {
        headers: {
          "X-Cache": "STALE",
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch global market data" },
      { status: 500 }
    );
  }
}
