import { NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.COINGECKO_BASE_URL || "https://api.coingecko.com/api/v3"

// Global price cache - shared across all requests
const globalPriceCache = new Map<string, { price: number; timestamp: number }>()
const CACHE_DURATION = 180000 // 3 minutes
const STALE_CACHE_DURATION = 1800000 // 30 minutes

// Batch fetch tracker to prevent duplicate requests
const pendingFetches = new Map<string, Promise<any>>()

// Rate limiting
const lastFetchTime = { timestamp: 0 }
const MIN_FETCH_INTERVAL = 5000 // 5 seconds between CoinGecko calls

async function fetchPricesFromCoinGecko(coinIds: string[]): Promise<Record<string, number>> {
  const now = Date.now()
  
  // Check if we need to wait
  const timeSinceLastFetch = now - lastFetchTime.timestamp
  if (timeSinceLastFetch < MIN_FETCH_INTERVAL) {
    const waitTime = MIN_FETCH_INTERVAL - timeSinceLastFetch
    console.log(`[Prices API] Waiting ${waitTime}ms before next fetch`)
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  const uniqueIds = [...new Set(coinIds)]
  const idsParam = uniqueIds.join(',')
  
  // Check if there's already a pending fetch for these coins
  if (pendingFetches.has(idsParam)) {
    console.log(`[Prices API] Reusing pending fetch for ${idsParam}`)
    return pendingFetches.get(idsParam)!
  }
  
  const url = `${BASE_URL}/simple/price?ids=${idsParam}&vs_currencies=usd`
  console.log(`[Prices API] Fetching: ${url}`)
  
  const fetchPromise = fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  })
    .then(async (response) => {
      lastFetchTime.timestamp = Date.now()
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }
      
      const data = await response.json()
      const prices: Record<string, number> = {}
      
      // Update global cache
      for (const [coinId, priceData] of Object.entries(data)) {
        const price = (priceData as any).usd
        if (price !== undefined) {
          prices[coinId] = price
          globalPriceCache.set(coinId, { price, timestamp: Date.now() })
        }
      }
      
      return prices
    })
    .finally(() => {
      pendingFetches.delete(idsParam)
    })
  
  pendingFetches.set(idsParam, fetchPromise)
  return fetchPromise
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ids = searchParams.get("ids")
    
    if (!ids) {
      return NextResponse.json(
        { error: "Missing ids parameter" },
        { status: 400 }
      )
    }
    
    const coinIds = ids.split(',').map(id => id.trim()).filter(Boolean)
    
    if (coinIds.length === 0) {
      return NextResponse.json(
        { error: "No valid coin IDs provided" },
        { status: 400 }
      )
    }
    
    const now = Date.now()
    const prices: Record<string, number> = {}
    const missingIds: string[] = []
    const staleIds: string[] = []
    
    // Check cache for each coin
    for (const coinId of coinIds) {
      const cached = globalPriceCache.get(coinId)
      
      if (cached) {
        const age = now - cached.timestamp
        
        if (age < CACHE_DURATION) {
          // Fresh cache
          prices[coinId] = cached.price
          console.log(`[Prices API] Fresh cache hit for ${coinId}`)
        } else if (age < STALE_CACHE_DURATION) {
          // Stale but usable
          prices[coinId] = cached.price
          staleIds.push(coinId)
          console.log(`[Prices API] Stale cache hit for ${coinId}`)
        } else {
          // Too old
          missingIds.push(coinId)
        }
      } else {
        missingIds.push(coinId)
      }
    }
    
    // If we have all prices from cache (fresh or stale), return immediately
    if (missingIds.length === 0) {
      console.log(`[Prices API] All prices from cache`)
      return NextResponse.json({
        prices,
        cached: true,
        stale: staleIds.length > 0,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=1800',
        }
      })
    }
    
    // Fetch missing prices
    try {
      const freshPrices = await fetchPricesFromCoinGecko(missingIds)
      
      // Merge with cached prices
      Object.assign(prices, freshPrices)
      
      console.log(`[Prices API] Fetched ${Object.keys(freshPrices).length} fresh prices`)
      
      return NextResponse.json({
        prices,
        cached: false,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=1800',
        }
      })
    } catch (error) {
      console.error(`[Prices API] Fetch error:`, error)
      
      // If we have stale cache for missing IDs, use it
      const hasStaleForMissing = missingIds.some(id => {
        const cached = globalPriceCache.get(id)
        if (cached && now - cached.timestamp < STALE_CACHE_DURATION) {
          prices[id] = cached.price
          return true
        }
        return false
      })
      
      if (Object.keys(prices).length > 0) {
        console.log(`[Prices API] Returning partial data with stale cache`)
        return NextResponse.json({
          prices,
          cached: true,
          stale: true,
          partial: true,
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=1800',
          }
        })
      }
      
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a moment." },
        { status: 429 }
      )
    }
  } catch (error) {
    console.error("[Prices API] Unexpected error:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch prices",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
