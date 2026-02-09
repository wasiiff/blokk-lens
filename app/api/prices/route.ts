import { NextRequest, NextResponse } from "next/server"
import { getCoinPrices } from "@/services/crypto-service"

// Global price cache - shared across all requests
const globalPriceCache = new Map<string, { price: number; timestamp: number; source: string }>()
const CACHE_DURATION = 180000 // 3 minutes
const STALE_CACHE_DURATION = 1800000 // 30 minutes

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
    const sources: Record<string, string> = {}
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
          sources[coinId] = cached.source
          console.log(`[Prices API] Fresh cache hit for ${coinId}`)
        } else if (age < STALE_CACHE_DURATION) {
          // Stale but usable
          prices[coinId] = cached.price
          sources[coinId] = cached.source
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
        sources,
        cached: true,
        stale: staleIds.length > 0,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=1800',
          'X-Cache': 'HIT',
        }
      })
    }
    
    // Fetch missing prices using the crypto-service (with fallback support)
    try {
      const freshPrices = await getCoinPrices(missingIds)
      
      // Merge with cached prices and update cache
      for (const [coinId, result] of Object.entries(freshPrices)) {
        prices[coinId] = result.price
        sources[coinId] = result.source
        globalPriceCache.set(coinId, { 
          price: result.price, 
          timestamp: now, 
          source: result.source 
        })
      }
      
      console.log(`[Prices API] Fetched ${Object.keys(freshPrices).length} prices with fallback support`)
      
      return NextResponse.json({
        prices,
        sources,
        cached: false,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=1800',
          'X-Cache': 'MISS',
        }
      })
    } catch (error) {
      console.error(`[Prices API] Fetch error:`, error)
      
      // If we have stale cache for missing IDs, use it
      for (const id of missingIds) {
        const cached = globalPriceCache.get(id)
        if (cached && now - cached.timestamp < STALE_CACHE_DURATION) {
          prices[id] = cached.price
          sources[id] = 'cache'
        }
      }
      
      if (Object.keys(prices).length > 0) {
        console.log(`[Prices API] Returning partial data with stale cache`)
        return NextResponse.json({
          prices,
          sources,
          cached: true,
          stale: true,
          partial: true,
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=1800',
            'X-Cache': 'STALE',
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
