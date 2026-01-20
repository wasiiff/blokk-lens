import { getTrendingCoins } from "@/services/coingecko";

// Cache for trending coins
const trendingCache = { data: null as any, timestamp: 0 };
const CACHE_DURATION = 300000; // 5 minutes (trending changes slowly)
const STALE_CACHE_DURATION = 1800000; // 30 minutes

let pendingRequest: Promise<any> | null = null;

export async function GET() {
  const now = Date.now();

  // Check fresh cache
  if (trendingCache.data && now - trendingCache.timestamp < CACHE_DURATION) {
    console.log('[Trending API] Fresh cache hit');
    return Response.json(trendingCache.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
        'X-Cache': 'HIT',
      }
    });
  }

  // Reuse pending request
  if (pendingRequest) {
    console.log('[Trending API] Reusing pending request');
    const data = await pendingRequest;
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
        'X-Cache': 'PENDING',
      }
    });
  }

  // Return stale cache while refreshing
  if (trendingCache.data && now - trendingCache.timestamp < STALE_CACHE_DURATION) {
    console.log('[Trending API] Returning stale cache, refreshing in background');
    
    // Refresh in background
    pendingRequest = getTrendingCoins()
      .then(data => {
        trendingCache.data = data;
        trendingCache.timestamp = Date.now();
        return data;
      })
      .catch(error => {
        console.error('[Trending API] Background refresh error:', error);
      })
      .finally(() => {
        pendingRequest = null;
      });
    
    return Response.json(trendingCache.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=1800',
        'X-Cache': 'STALE',
      }
    });
  }

  // Fetch fresh data
  try {
    pendingRequest = getTrendingCoins();
    const data = await pendingRequest;
    
    trendingCache.data = data;
    trendingCache.timestamp = now;
    
    console.log('[Trending API] Fetched fresh data');
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
        'X-Cache': 'MISS',
      }
    });
  } catch (error) {
    console.error('[Trending API] Error:', error);
    
    // Return stale cache on error
    if (trendingCache.data) {
      console.log('[Trending API] Error occurred, using stale cache');
      return Response.json(trendingCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=1800',
          'X-Cache': 'ERROR-STALE',
        }
      });
    }
    
    return Response.json({ error: "Failed to fetch trending coins" }, { status: 500 });
  } finally {
    pendingRequest = null;
  }
}
