import { getMarketCoins, getGlobalData } from "@/services/coingecko";
import { NextResponse } from "next/server";

// Cache for aggregated stats
let statsCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 300000; // 5 minutes (increased from 3)
const MAX_PAGES_TO_FETCH = 4; // Only fetch 1,000 coins (4 pages * 250 coins) - enough for accurate stats

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

// Fetch coins in batches to avoid rate limits
async function fetchAllCoins(maxPages: number): Promise<CoinData[]> {
  const allCoins: CoinData[] = [];
  
  // Fetch pages sequentially with delay to respect rate limits
  for (let page = 1; page <= maxPages; page++) {
    try {
      const coins = await getMarketCoins({ page, per_page: 250 });
      allCoins.push(...coins);
      
      // Delay between requests to respect rate limits (free tier: ~10-30 calls/min)
      if (page < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    } catch (err) {
      console.error(`[Stats API] Error fetching page ${page}:`, err);
      // Continue with what we have
      break;
    }
  }
  
  return allCoins;
}

export async function GET() {
  const now = Date.now();

  // Return cached data if still fresh
  if (statsCache && now - statsCache.timestamp < CACHE_DURATION) {
    console.log("[Stats API] Cache hit");
    return Response.json(statsCache.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600',
        'X-Cache': 'HIT',
      }
    });
  }

  try {
    console.log("[Stats API] Fetching fresh data for ALL coins...");
    const startTime = Date.now();
    
    // Fetch global data first
    const globalData = await getGlobalData();
    
    // Determine how many pages to fetch (limit to top coins for stats)
    // Top 1,000 coins by market cap are sufficient for accurate market stats
    const pagesToFetch = Math.min(MAX_PAGES_TO_FETCH, 4);
    
    console.log(`[Stats API] Fetching ${pagesToFetch} pages (~${pagesToFetch * 250} top coins for stats)`);
    
    // Fetch top coins only
    const allCoins = await fetchAllCoins(pagesToFetch);
    
    console.log(`[Stats API] Fetched ${allCoins.length} coins in ${Date.now() - startTime}ms`);
    
    // Filter out coins with null/undefined price changes
    const validCoins = allCoins.filter(
      coin => coin.price_change_percentage_24h !== null && 
              coin.price_change_percentage_24h !== undefined
    );

    // Calculate average change across all valid coins
    const totalChange = validCoins.reduce(
      (sum, coin) => sum + coin.price_change_percentage_24h, 
      0
    );
    const avgChange = validCoins.length > 0 ? totalChange / validCoins.length : 0;

    // Find top gainer
    const topGainer = validCoins.reduce((max, coin) => 
      coin.price_change_percentage_24h > max.price_change_percentage_24h ? coin : max
    , validCoins[0] || null);

    // Find top loser
    const topLoser = validCoins.reduce((min, coin) => 
      coin.price_change_percentage_24h < min.price_change_percentage_24h ? coin : min
    , validCoins[0] || null);

    // Calculate market sentiment (% of coins with positive change)
    const positiveCoins = validCoins.filter(coin => coin.price_change_percentage_24h > 0);
    const marketSentiment = validCoins.length > 0 
      ? (positiveCoins.length / validCoins.length) * 100 
      : 50;

    const stats = {
      global: {
        totalMarketCap: globalData?.data?.total_market_cap?.usd || 0,
        totalVolume: globalData?.data?.total_volume?.usd || 0,
        marketCapChange: globalData?.data?.market_cap_change_percentage_24h_usd || 0,
        activeCryptocurrencies: globalData?.data?.active_cryptocurrencies || 0,
      },
      calculated: {
        avgChange,
        topGainer: topGainer ? {
          id: topGainer.id,
          symbol: topGainer.symbol,
          name: topGainer.name,
          image: topGainer.image,
          priceChange: topGainer.price_change_percentage_24h,
        } : null,
        topLoser: topLoser ? {
          id: topLoser.id,
          symbol: topLoser.symbol,
          name: topLoser.name,
          image: topLoser.image,
          priceChange: topLoser.price_change_percentage_24h,
        } : null,
        marketSentiment,
        coinsAnalyzed: validCoins.length,
        totalCoins: allCoins.length,
      },
      timestamp: now,
    };

    // Update cache
    statsCache = {
      data: stats,
      timestamp: now,
    };

    console.log(`[Stats API] Calculated stats from ${validCoins.length} coins (total: ${allCoins.length})`);

    return Response.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      }
    });

  } catch (error) {
    console.error("[Stats API] Error:", error);

    // Return stale cache if available
    if (statsCache) {
      console.log("[Stats API] Error occurred, returning stale cache");
      return Response.json(statsCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
          'X-Cache': 'ERROR-STALE',
        }
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch market stats" },
      { status: 500 }
    );
  }
}
