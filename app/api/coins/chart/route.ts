import { NextRequest, NextResponse } from 'next/server';
import { getCoinMarketChart } from '@/services/crypto-service';

// Cache for chart data
const chartCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutes (increased from 1 minute)
const STALE_CACHE_DURATION = 900000; // 15 minutes

// Pending requests to prevent duplicate calls
const pendingRequests = new Map<string, Promise<any>>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coinId = searchParams.get('coinId');
    const daysParam = searchParams.get('days') || '30';
    const days = daysParam === 'max' ? 'max' : parseInt(daysParam, 10);

    if (!coinId) {
      return NextResponse.json({ error: 'Coin ID is required' }, { status: 400 });
    }

    const cacheKey = `${coinId}-${days}`;
    const now = Date.now();
    const cached = chartCache.get(cacheKey);

    // Check fresh cache
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`[Chart API] Cache hit for ${cacheKey}`);
      return NextResponse.json(cached.data, {
        headers: { 
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        },
      });
    }

    // Check if there's a pending request
    if (pendingRequests.has(cacheKey)) {
      console.log(`[Chart API] Reusing pending request for ${cacheKey}`);
      const data = await pendingRequests.get(cacheKey);
      return NextResponse.json(data, {
        headers: { 
          'X-Cache': 'PENDING',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        },
      });
    }

    // Return stale cache while fetching in background
    if (cached && now - cached.timestamp < STALE_CACHE_DURATION) {
      console.log(`[Chart API] Returning stale cache for ${cacheKey}, refreshing in background`);
      
      // Fetch in background (don't await)
      const fetchPromise = getCoinMarketChart(coinId, 'usd', days)
        .then(data => {
          chartCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        })
        .catch(error => {
          console.error(`[Chart API] Background refresh error for ${cacheKey}:`, error);
        })
        .finally(() => {
          pendingRequests.delete(cacheKey);
        });
      
      pendingRequests.set(cacheKey, fetchPromise);
      
      return NextResponse.json(cached.data, {
        headers: { 
          'X-Cache': 'STALE',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=900',
        },
      });
    }

    // Fetch fresh data
    const fetchPromise = getCoinMarketChart(coinId, 'usd', days);
    pendingRequests.set(cacheKey, fetchPromise);

    const data = await fetchPromise;

    if (!data || !data.prices || data.prices.length === 0) {
      throw new Error('No chart data returned');
    }

    // Update cache
    chartCache.set(cacheKey, { data, timestamp: now });
    pendingRequests.delete(cacheKey);

    console.log(`[Chart API] Fetched fresh data for ${cacheKey}`);

    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'X-Data-Source': 'crypto-service',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
      },
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);

    // Try stale cache
    const { searchParams } = new URL(req.url);
    const coinId = searchParams.get('coinId');
    const days = searchParams.get('days') || '30';
    const cacheKey = `${coinId}-${days}`;
    const cached = chartCache.get(cacheKey);
    const now = Date.now();

    pendingRequests.delete(cacheKey);

    if (cached && now - cached.timestamp < STALE_CACHE_DURATION) {
      console.log(`[Chart API] Error occurred, using stale cache for ${cacheKey}`);
      return NextResponse.json(cached.data, {
        headers: { 
          'X-Cache': 'ERROR-STALE',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=900',
        },
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
