import { NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.COINGECKO_BASE_URL || "https://api.coingecko.com/api/v3"

// In-memory cache with timestamps
const priceCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds cache

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fromId = searchParams.get("from")
    const toId = searchParams.get("to")

    console.log(`[Convert API] Request: from=${fromId}, to=${toId}`)

    if (!fromId || !toId) {
      return NextResponse.json(
        { error: "Missing from or to parameter" },
        { status: 400 }
      )
    }

    // Same coin conversion
    if (fromId === toId) {
      return NextResponse.json({
        rate: 1,
        fromPrice: 1,
        toPrice: 1,
        from: fromId,
        to: toId,
        cached: false,
      })
    }

    // Create cache key (sorted to handle both directions)
    const cacheKey = [fromId, toId].sort().join("-")
    const now = Date.now()

    // Check cache
    const cached = priceCache.get(cacheKey)
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`[Convert API] Cache hit for ${cacheKey}`)
      const data = cached.data
      const fromPrice = data[fromId]?.usd
      const toPrice = data[toId]?.usd
      
      if (fromPrice && toPrice) {
        const rate = fromPrice / toPrice
        return NextResponse.json({
          rate,
          fromPrice,
          toPrice,
          from: fromId,
          to: toId,
          cached: true,
        })
      }
    }

    const url = `${BASE_URL}/simple/price?ids=${fromId},${toId}&vs_currencies=usd`
    console.log(`[Convert API] Fetching: ${url}`)

    // Fetch both coin prices in USD
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // Don't use Next.js cache, use our own
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Convert API] CoinGecko error: ${response.status} ${response.statusText}`, errorText)
      
      // If rate limited and we have stale cache, use it
      if (response.status === 429 && cached) {
        console.log(`[Convert API] Rate limited, using stale cache for ${cacheKey}`)
        const data = cached.data
        const fromPrice = data[fromId]?.usd
        const toPrice = data[toId]?.usd
        
        if (fromPrice && toPrice) {
          const rate = fromPrice / toPrice
          return NextResponse.json({
            rate,
            fromPrice,
            toPrice,
            from: fromId,
            to: toId,
            cached: true,
            stale: true,
          })
        }
      }
      
      return NextResponse.json(
        { error: `CoinGecko API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`[Convert API] Response data:`, data)

    // Store in cache
    priceCache.set(cacheKey, { data, timestamp: now })

    const fromPrice = data[fromId]?.usd
    const toPrice = data[toId]?.usd

    if (!fromPrice || !toPrice) {
      console.error(`[Convert API] Missing prices - fromPrice: ${fromPrice}, toPrice: ${toPrice}`)
      console.error(`[Convert API] Available data:`, JSON.stringify(data))
      return NextResponse.json(
        { 
          error: "Could not fetch prices for one or both coins",
          details: `Missing: ${!fromPrice ? fromId : ''} ${!toPrice ? toId : ''}`,
          availableCoins: Object.keys(data)
        },
        { status: 404 }
      )
    }

    const rate = fromPrice / toPrice

    console.log(`[Convert API] Success: rate=${rate}`)

    return NextResponse.json({
      rate,
      fromPrice,
      toPrice,
      from: fromId,
      to: toId,
      cached: false,
    })
  } catch (error) {
    console.error("[Convert API] Unexpected error:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch conversion rate",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
