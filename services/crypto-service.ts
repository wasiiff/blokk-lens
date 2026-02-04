/**
 * Unified Crypto Service with Fallback Support
 * Primary: CoinGecko API
 * Fallback: Binance API
 *
 * Automatically handles timeouts and API failures with graceful degradation
 */

import * as CoinGecko from "./coingecko";
import * as Binance from "./binance";

// Cache data types
type CacheableData = number | MarketCoinResult[] | CoinDetailsResult;

interface CacheEntry {
  data: CacheableData;
  timestamp: number;
  source: "coingecko" | "binance";
}

// Cache for fallback data
const fallbackCache = new Map<string, CacheEntry>();
const FALLBACK_CACHE_DURATION = 300000; // 5 minutes

export type DataSource = "coingecko" | "binance" | "cache";

export interface PriceResult {
  price: number;
  source: DataSource;
  coinId: string;
}

export interface MarketCoinResult {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  source: DataSource;
}

export interface CoinDetailsResult {
  id: string;
  symbol: string;
  name: string;
  image: { large: string; small: string; thumb: string };
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    market_cap: { usd: number };
    market_cap_rank: number;
    high_24h: { usd: number };
    low_24h: { usd: number };
    circulating_supply: number;
    total_supply: number | null;
    ath: { usd: number };
  };
  description?: { en: string };
  links?: { homepage: string[]; blockchain_site: string[] };
  source: DataSource;
}

// Interface for CoinGecko market coin response
interface CoinGeckoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
}

/**
 * Execute with timeout wrapper
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    ),
  ]);
}

/**
 * Get coin price with fallback
 */
export async function getCoinPrice(coinId: string): Promise<PriceResult> {
  const cacheKey = `price-${coinId}`;
  const cached = fallbackCache.get(cacheKey);
  const now = Date.now();

  // Try CoinGecko first
  try {
    const coinDetails = await withTimeout(CoinGecko.getCoinDetails(coinId), 8000);
    const price = coinDetails?.market_data?.current_price?.usd;

    if (price !== undefined) {
      fallbackCache.set(cacheKey, { data: price, timestamp: now, source: "coingecko" });
      return { price, source: "coingecko", coinId };
    }
  } catch (error) {
    console.log(`[CryptoService] CoinGecko failed for ${coinId}:`, (error as Error).message);
  }

  // Try Binance fallback
  if (Binance.isCoinSupported(coinId)) {
    try {
      const priceData = await withTimeout(Binance.getPriceDataByCoinGeckoId(coinId), 5000);

      if (priceData) {
        fallbackCache.set(cacheKey, { data: priceData.currentPrice, timestamp: now, source: "binance" });
        console.log(`[CryptoService] Using Binance fallback for ${coinId}`);
        return { price: priceData.currentPrice, source: "binance", coinId };
      }
    } catch (error) {
      console.log(`[CryptoService] Binance fallback failed for ${coinId}:`, (error as Error).message);
    }
  }

  // Use cache if available
  if (cached && now - cached.timestamp < FALLBACK_CACHE_DURATION) {
    console.log(`[CryptoService] Using cached data for ${coinId}`);
    return { price: cached.data as number, source: "cache", coinId };
  }

  throw new Error(`Failed to get price for ${coinId} from all sources`);
}

/**
 * Get multiple coin prices with fallback
 */
export async function getCoinPrices(coinIds: string[]): Promise<Record<string, PriceResult>> {
  const results: Record<string, PriceResult> = {};
  const failedIds: string[] = [];
  const now = Date.now();

  // Try CoinGecko for all coins in batch
  try {
    const coins = await withTimeout(
      CoinGecko.getMarketCoins({ vs_currency: "usd", page: 1, per_page: 250 }),
      10000
    );

    for (const coin of coins) {
      if (coinIds.includes(coin.id)) {
        results[coin.id] = {
          price: coin.current_price,
          source: "coingecko",
          coinId: coin.id,
        };
        fallbackCache.set(`price-${coin.id}`, {
          data: coin.current_price,
          timestamp: now,
          source: "coingecko",
        });
      }
    }

    // Find coins not in results
    for (const id of coinIds) {
      if (!results[id]) {
        failedIds.push(id);
      }
    }
  } catch (error) {
    console.log("[CryptoService] CoinGecko batch fetch failed:", (error as Error).message);
    failedIds.push(...coinIds);
  }

  // Try Binance for failed IDs
  if (failedIds.length > 0) {
    const supportedIds = failedIds.filter((id) => Binance.isCoinSupported(id));

    if (supportedIds.length > 0) {
      try {
        const binancePrices = await withTimeout(
          Binance.getPricesByCoinGeckoIds(supportedIds),
          5000
        );

        for (const [id, price] of Object.entries(binancePrices)) {
          results[id] = { price, source: "binance", coinId: id };
          fallbackCache.set(`price-${id}`, { data: price, timestamp: now, source: "binance" });
          console.log(`[CryptoService] Using Binance fallback for ${id}`);
        }
      } catch (error) {
        console.log("[CryptoService] Binance batch fallback failed:", (error as Error).message);
      }
    }
  }

  // Use cache for any remaining failed IDs
  for (const id of coinIds) {
    if (!results[id]) {
      const cached = fallbackCache.get(`price-${id}`);
      if (cached && now - cached.timestamp < FALLBACK_CACHE_DURATION) {
        results[id] = { price: cached.data as number, source: "cache", coinId: id };
        console.log(`[CryptoService] Using cached data for ${id}`);
      }
    }
  }

  return results;
}

/**
 * Get market coins with fallback
 */
export async function getMarketCoins(options: {
  vs_currency?: string;
  page?: number;
  per_page?: number;
}): Promise<MarketCoinResult[]> {
  const cacheKey = `market-${options.page || 1}-${options.per_page || 20}`;
  const cached = fallbackCache.get(cacheKey);
  const now = Date.now();

  // Try CoinGecko first
  try {
    const coins = await withTimeout(CoinGecko.getMarketCoins(options), 10000);

    const results: MarketCoinResult[] = coins.map((coin: CoinGeckoMarketCoin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
      total_volume: coin.total_volume,
      source: "coingecko" as DataSource,
    }));

    fallbackCache.set(cacheKey, { data: results, timestamp: now, source: "coingecko" });
    return results;
  } catch (error) {
    console.log("[CryptoService] CoinGecko market fetch failed:", (error as Error).message);
  }

  // Try Binance fallback for supported coins
  try {
    const supportedIds = Binance.getSupportedCoinIds();
    const binanceData = await withTimeout(Binance.getMarketDataByCoinGeckoIds(supportedIds), 8000);

    if (binanceData.length === 0) {
      throw new Error("No data from Binance");
    }

    // Create fallback market data (limited data from Binance)
    // Note: Binance doesn't provide market cap, so we omit it rather than estimate
    const results: MarketCoinResult[] = binanceData
      .sort((a, b) => b.quoteVolume24h - a.quoteVolume24h) // Sort by volume as proxy for popularity
      .slice(0, options.per_page || 20) // Limit to requested page size
      .map((coin, index) => {
        // Generate proper coin name from ID
        const coinName = coin.coinGeckoId
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return {
          id: coin.coinGeckoId,
          symbol: coin.symbol.replace("USDT", "").toLowerCase(),
          name: coinName,
          image: `https://assets.coingecko.com/coins/images/1/small/${coin.coinGeckoId}.png`,
          current_price: coin.currentPrice,
          market_cap: 0, // Binance doesn't provide this
          market_cap_rank: index + 1,
          price_change_percentage_24h: coin.priceChangePercent24h,
          high_24h: coin.high24h,
          low_24h: coin.low24h,
          total_volume: coin.volume24h,
          source: "binance" as DataSource,
        };
      });

    if (results.length > 0) {
      console.log(`[CryptoService] Using Binance fallback, got ${results.length} coins`);
      fallbackCache.set(cacheKey, { data: results, timestamp: now, source: "binance" });
      return results;
    }
  } catch (error) {
    console.log("[CryptoService] Binance market fallback failed:", (error as Error).message);
  }

  // Use cache if available
  if (cached && now - cached.timestamp < FALLBACK_CACHE_DURATION) {
    console.log("[CryptoService] Using cached market data");
    return cached.data as MarketCoinResult[];
  }

  throw new Error("Failed to fetch market data from all sources");
}

/**
 * Get coin details with fallback
 */
export async function getCoinDetails(coinId: string): Promise<CoinDetailsResult> {
  const cacheKey = `details-${coinId}`;
  const cached = fallbackCache.get(cacheKey);
  const now = Date.now();

  // Try CoinGecko first
  try {
    const details = await withTimeout(CoinGecko.getCoinDetails(coinId), 10000);

    const result: CoinDetailsResult = {
      id: details.id,
      symbol: details.symbol,
      name: details.name,
      image: details.image,
      market_data: details.market_data,
      description: details.description,
      links: details.links,
      source: "coingecko",
    };

    fallbackCache.set(cacheKey, { data: result, timestamp: now, source: "coingecko" });
    return result;
  } catch (error) {
    console.log(`[CryptoService] CoinGecko details failed for ${coinId}:`, (error as Error).message);
  }

  // Try Binance fallback
  if (Binance.isCoinSupported(coinId)) {
    try {
      const priceData = await withTimeout(Binance.getPriceDataByCoinGeckoId(coinId), 5000);

      if (priceData) {
        // Generate proper coin name from ID
        const coinName = coinId
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        const result: CoinDetailsResult = {
          id: coinId,
          symbol: priceData.symbol.replace("USDT", "").toLowerCase(),
          name: coinName,
          image: {
            large: `https://assets.coingecko.com/coins/images/1/large/${coinId}.png`,
            small: `https://assets.coingecko.com/coins/images/1/small/${coinId}.png`,
            thumb: `https://assets.coingecko.com/coins/images/1/thumb/${coinId}.png`,
          },
          market_data: {
            current_price: { usd: priceData.currentPrice },
            price_change_percentage_24h: priceData.priceChangePercent24h,
            market_cap: { usd: 0 }, // Binance doesn't provide this
            market_cap_rank: 0,
            high_24h: { usd: priceData.high24h },
            low_24h: { usd: priceData.low24h },
            circulating_supply: 0,
            total_supply: null,
            ath: { usd: priceData.high24h }, // Use 24h high as approximation
          },
          description: { en: `Price data from Binance. Full details unavailable.` },
          links: { homepage: [], blockchain_site: [] },
          source: "binance",
        };

        console.log(`[CryptoService] Using Binance fallback details for ${coinId}`);
        fallbackCache.set(cacheKey, { data: result, timestamp: now, source: "binance" });
        return result;
      }
    } catch (error) {
      console.log(`[CryptoService] Binance details fallback failed for ${coinId}:`, (error as Error).message);
    }
  }

  // Use cache if available
  if (cached && now - cached.timestamp < FALLBACK_CACHE_DURATION) {
    console.log(`[CryptoService] Using cached details for ${coinId}`);
    return cached.data as CoinDetailsResult;
  }

  throw new Error(`Failed to get details for ${coinId} from all sources`);
}

/**
 * Get trending coins (CoinGecko only, no Binance equivalent)
 */
export async function getTrendingCoins() {
  try {
    return await withTimeout(CoinGecko.getTrendingCoins(), 8000);
  } catch (error) {
    console.log("[CryptoService] CoinGecko trending failed:", (error as Error).message);

    // Return hardcoded popular coins as fallback
    return {
      coins: [
        { item: { id: "bitcoin", name: "Bitcoin", symbol: "BTC", market_cap_rank: 1 } },
        { item: { id: "ethereum", name: "Ethereum", symbol: "ETH", market_cap_rank: 2 } },
        { item: { id: "solana", name: "Solana", symbol: "SOL", market_cap_rank: 5 } },
        { item: { id: "binancecoin", name: "BNB", symbol: "BNB", market_cap_rank: 4 } },
        { item: { id: "ripple", name: "XRP", symbol: "XRP", market_cap_rank: 3 } },
        { item: { id: "cardano", name: "Cardano", symbol: "ADA", market_cap_rank: 8 } },
        { item: { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", market_cap_rank: 9 } },
      ],
    };
  }
}

/**
 * Get global market data (CoinGecko only)
 */
export async function getGlobalData() {
  try {
    return await withTimeout(CoinGecko.getGlobalData(), 8000);
  } catch (error) {
    console.log("[CryptoService] CoinGecko global data failed:", (error as Error).message);
    throw error;
  }
}

/**
 * Search coins (CoinGecko only)
 */
export async function searchCoins(query: string) {
  try {
    return await withTimeout(CoinGecko.searchCoins(query), 8000);
  } catch (error) {
    console.log("[CryptoService] CoinGecko search failed:", (error as Error).message);
    throw error;
  }
}

/**
 * Calculate optimal Binance interval and limit based on requested days
 */
function calculateBinanceParams(days: number): { interval: string; limit: number } {
  if (days <= 1) {
    // For 1 day or less, use 15-minute intervals
    return { interval: "15m", limit: Math.min(96, Math.ceil((days * 24 * 60) / 15)) };
  } else if (days <= 3) {
    // For 2-3 days, use 1-hour intervals
    return { interval: "1h", limit: Math.min(72, Math.ceil(days * 24)) };
  } else if (days <= 7) {
    // For 4-7 days, use 2-hour intervals
    return { interval: "2h", limit: Math.min(84, Math.ceil((days * 24) / 2)) };
  } else if (days <= 30) {
    // For 8-30 days, use 4-hour intervals
    return { interval: "4h", limit: Math.min(180, Math.ceil((days * 24) / 4)) };
  } else if (days <= 90) {
    // For 31-90 days, use 1-day intervals
    return { interval: "1d", limit: Math.min(90, days) };
  } else {
    // For more than 90 days, use 1-day intervals with max limit
    return { interval: "1d", limit: Math.min(1000, days) };
  }
}

/**
 * Get coin OHLC data (with Binance fallback)
 */
export async function getCoinOHLC(
  coinId: string,
  vs_currency: string = "usd",
  days: number = 30
) {
  // Try CoinGecko first
  try {
    return await withTimeout(CoinGecko.getCoinOHLC(coinId, vs_currency, days), 10000);
  } catch (error) {
    console.log(`[CryptoService] CoinGecko OHLC failed for ${coinId}:`, (error as Error).message);
  }

  // Try Binance fallback
  if (Binance.isCoinSupported(coinId)) {
    try {
      const symbol = Binance.getBinanceSymbol(coinId);
      if (symbol) {
        const { interval, limit } = calculateBinanceParams(days);
        const klines = await withTimeout(Binance.getKlines(symbol, interval, limit), 5000);

        // Convert Binance kline format to CoinGecko OHLC format
        // CoinGecko format: [timestamp, open, high, low, close]
        const ohlcData = klines.map((kline) => [
          kline.openTime,
          parseFloat(kline.open),
          parseFloat(kline.high),
          parseFloat(kline.low),
          parseFloat(kline.close),
        ]);

        console.log(`[CryptoService] Using Binance OHLC fallback for ${coinId} (${interval}, ${klines.length} candles)`);
        return ohlcData;
      }
    } catch (error) {
      console.log(`[CryptoService] Binance OHLC fallback failed for ${coinId}:`, (error as Error).message);
    }
  }

  throw new Error(`Failed to get OHLC data for ${coinId} from all sources`);
}

/**
 * Get coin market chart data (with Binance fallback)
 */
export async function getCoinMarketChart(
  coinId: string,
  vs_currency: string = "usd",
  days: number = 30
) {
  // Try CoinGecko first
  try {
    return await withTimeout(CoinGecko.getCoinMarketChart(coinId, vs_currency, days), 10000);
  } catch (error) {
    console.log(`[CryptoService] CoinGecko chart failed for ${coinId}:`, (error as Error).message);
  }

  // Try Binance fallback
  if (Binance.isCoinSupported(coinId)) {
    try {
      const symbol = Binance.getBinanceSymbol(coinId);
      if (symbol) {
        const { interval, limit } = calculateBinanceParams(days);
        const klines = await withTimeout(Binance.getKlines(symbol, interval, limit), 5000);

        // Convert Binance kline format to CoinGecko market_chart format
        const chartData = {
          prices: klines.map((kline) => [kline.closeTime, parseFloat(kline.close)]),
          market_caps: klines.map((kline) => [kline.closeTime, 0]), // Binance doesn't provide market cap
          total_volumes: klines.map((kline) => [kline.closeTime, parseFloat(kline.volume)]),
        };

        console.log(`[CryptoService] Using Binance chart fallback for ${coinId} (${interval}, ${klines.length} candles)`);
        return chartData;
      }
    } catch (error) {
      console.log(`[CryptoService] Binance chart fallback failed for ${coinId}:`, (error as Error).message);
    }
  }

  throw new Error(`Failed to get chart data for ${coinId} from all sources`);
}

/**
 * Get service health status
 */
export async function getServiceHealth(): Promise<{
  coingecko: boolean;
  binance: boolean;
}> {
  const [coingeckoHealth, binanceHealth] = await Promise.allSettled([
    withTimeout(CoinGecko.getGlobalData(), 5000).then(() => true).catch(() => false),
    Binance.checkBinanceHealth(),
  ]);

  return {
    coingecko: coingeckoHealth.status === "fulfilled" ? coingeckoHealth.value : false,
    binance: binanceHealth.status === "fulfilled" ? binanceHealth.value : false,
  };
}
