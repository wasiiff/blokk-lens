import { NextRequest, NextResponse } from 'next/server';
import { getCoinMarketChart } from '@/services/crypto-service';

// Cache for chart data
const chartCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute
const STALE_CACHE_DURATION = 300000; // 5 minutes

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coinId = searchParams.get('coinId');
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (!coinId) {
      return NextResponse.json({ error: 'Coin ID is required' }, { status: 400 });
    }

    const cacheKey = `${coinId}-${days}`;
    const now = Date.now();
    const cached = chartCache.get(cacheKey);

    // Check fresh cache
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    const data = await getCoinMarketChart(coinId, 'usd', days);

    // Update cache
    chartCache.set(cacheKey, { data, timestamp: now });

    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'X-Data-Source': 'crypto-service',
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

    if (cached && now - cached.timestamp < STALE_CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: { 'X-Cache': 'STALE' },
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
