import { getCoinDetails } from "@/services/crypto-service";
import { NextResponse } from "next/server";

// Cache for coin details
const coinDetailsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute
const STALE_CACHE_DURATION = 300000; // 5 minutes

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const now = Date.now();

  // Check fresh cache
  const cached = coinDetailsCache.get(id);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data, {
      headers: {
        "X-Cache": "HIT",
        "X-Data-Source": cached.data.source || "cached",
      },
    });
  }

  try {
    const data = await getCoinDetails(id);

    // Update cache
    coinDetailsCache.set(id, { data, timestamp: now });

    return NextResponse.json(data, {
      headers: {
        "X-Cache": "MISS",
        "X-Data-Source": data.source || "unknown",
      },
    });
  } catch (error) {
    console.error(`[Coin API] Error fetching ${id}:`, error);

    // Try stale cache
    if (cached && now - cached.timestamp < STALE_CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: {
          "X-Cache": "STALE",
          "X-Data-Source": "cached",
        },
      });
    }

    return NextResponse.json(
      { error: `Failed to fetch coin details for ${id}` },
      { status: 500 }
    );
  }
}
