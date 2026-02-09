/**
 * Binance API Service - Fallback provider for cryptocurrency data
 * Used when CoinGecko API times out or is unavailable
 */

const BINANCE_BASE_URL = "https://api.binance.com/api/v3";

// Map common CoinGecko IDs to Binance symbols
const COINGECKO_TO_BINANCE_MAP: Record<string, string> = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  binancecoin: "BNBUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT",
  solana: "SOLUSDT",
  polkadot: "DOTUSDT",
  dogecoin: "DOGEUSDT",
  avalanche: "AVAXUSDT",
  "shiba-inu": "SHIBUSDT",
  polygon: "MATICUSDT",
  litecoin: "LTCUSDT",
  chainlink: "LINKUSDT",
  uniswap: "UNIUSDT",
  cosmos: "ATOMUSDT",
  stellar: "XLMUSDT",
  monero: "XMRUSDT",
  algorand: "ALGOUSDT",
  vechain: "VETUSDT",
  filecoin: "FILUSDT",
  tron: "TRXUSDT",
  "wrapped-bitcoin": "WBTCUSDT",
  "near-protocol": "NEARUSDT",
  "internet-computer": "ICPUSDT",
  aptos: "APTUSDT",
  aave: "AAVEUSDT",
  "the-graph": "GRTUSDT",
  fantom: "FTMUSDT",
  sand: "SANDUSDT",
  decentraland: "MANAUSDT",
  "axie-infinity": "AXSUSDT",
  eos: "EOSUSDT",
  maker: "MKRUSDT",
  optimism: "OPUSDT",
  arbitrum: "ARBUSDT",
  sui: "SUIUSDT",
  pepe: "PEPEUSDT",
  immutable: "IMXUSDT",
  injective: "INJUSDT",
  render: "RENDERUSDT",
  celestia: "TIAUSDT",
  sei: "SEIUSDT",
  bonk: "BONKUSDT",
  jupiter: "JUPUSDT",
  starknet: "STRKUSDT",
  toncoin: "TONUSDT",
  // Additional popular coins
  "bitcoin-cash": "BCHUSDT",
  "ethereum-classic": "ETCUSDT",
  "pancakeswap-token": "CAKEUSDT",
  "thorchain": "RUNEUSDT",
  "hedera-hashgraph": "HBARUSDT",
  "quant-network": "QNTUSDT",
  "lido-dao": "LDOUSDT",
  "kaspa": "KASPAUSDT",
  "cronos": "CROUSDT",
  "mantle": "MNTUSDT",
  "okb": "OKBUSDT",
  "fetch-ai": "FETUSDT",
  "theta-token": "THETAUSDT",
  "flow": "FLOWUSDT",
  "axelar": "AXLUSDT",
  "kava": "KAVAUSDT",
  "gala": "GALAUSDT",
  "enjincoin": "ENJUSDT",
  "chiliz": "CHZUSDT",
  "1inch": "1INCHUSDT",
  "compound-governance-token": "COMPUSDT",
  "curve-dao-token": "CRVUSDT",
  "synthetix-network-token": "SNXUSDT",
  "yearn-finance": "YFIUSDT",
  "sushi": "SUSHIUSDT",
  "balancer": "BALUSDT",
  "uma": "UMAUSDT",
  "loopring": "LRCUSDT",
  "matic-network": "MATICUSDT",
  "zilliqa": "ZILUSDT",
  "basic-attention-token": "BATUSDT",
  "zcash": "ZECUSDT",
  "dash": "DASHUSDT",
  "neo": "NEOUSDT",
  "iota": "IOTAUSDT",
  "qtum": "QTUMUSDT",
  "ontology": "ONTUSDT",
  "icon": "ICXUSDT",
  "waves": "WAVESUSDT",
};

// Map Binance symbol back to CoinGecko ID
const BINANCE_TO_COINGECKO_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(COINGECKO_TO_BINANCE_MAP).map(([key, value]) => [value, key])
);

interface BinanceTickerResponse {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

interface BinanceKlineResponse {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
  ignore: string;
}

export interface BinancePriceData {
  symbol: string;
  coinGeckoId: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
}

async function fetchWithTimeout<T>(url: string, timeoutMs: number = 10000): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Binance API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Binance API timeout after ${timeoutMs}ms`);
      }
      throw error;
    }
    throw new Error("Unknown Binance API error");
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch with retry logic for transient failures
 */
async function fetchWithRetry<T>(
  url: string,
  timeoutMs: number = 10000,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchWithTimeout<T>(url, timeoutMs);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on 4xx errors (client errors)
      if (lastError.message.includes("400") || 
          lastError.message.includes("401") || 
          lastError.message.includes("403") ||
          lastError.message.includes("404")) {
        throw lastError;
      }

      // Only retry if not the last attempt
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 3000); // Exponential backoff, max 3s
        console.log(`[Binance] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Binance API request failed");
}

/**
 * Get Binance symbol from CoinGecko ID
 */
export function getBinanceSymbol(coinGeckoId: string): string | null {
  return COINGECKO_TO_BINANCE_MAP[coinGeckoId.toLowerCase()] || null;
}

/**
 * Get CoinGecko ID from Binance symbol
 */
export function getCoinGeckoId(binanceSymbol: string): string | null {
  return BINANCE_TO_COINGECKO_MAP[binanceSymbol.toUpperCase()] || null;
}

/**
 * Get 24hr ticker statistics for a symbol
 */
export async function get24hrTicker(symbol: string): Promise<BinanceTickerResponse> {
  return fetchWithRetry<BinanceTickerResponse>(
    `${BINANCE_BASE_URL}/ticker/24hr?symbol=${symbol}`
  );
}

/**
 * Get 24hr ticker statistics for multiple symbols
 */
export async function get24hrTickerMultiple(symbols: string[]): Promise<BinanceTickerResponse[]> {
  const symbolsParam = JSON.stringify(symbols);
  return fetchWithRetry<BinanceTickerResponse[]>(
    `${BINANCE_BASE_URL}/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`
  );
}

/**
 * Get current price for a symbol
 */
export async function getPrice(symbol: string): Promise<{ symbol: string; price: string }> {
  return fetchWithRetry<{ symbol: string; price: string }>(
    `${BINANCE_BASE_URL}/ticker/price?symbol=${symbol}`
  );
}

/**
 * Get current prices for multiple symbols
 */
export async function getPricesMultiple(
  symbols: string[]
): Promise<Array<{ symbol: string; price: string }>> {
  const symbolsParam = JSON.stringify(symbols);
  return fetchWithRetry<Array<{ symbol: string; price: string }>>(
    `${BINANCE_BASE_URL}/ticker/price?symbols=${encodeURIComponent(symbolsParam)}`
  );
}

// Binance kline tuple type: [openTime, open, high, low, close, volume, closeTime, quoteAssetVolume, numberOfTrades, takerBuyBaseAssetVolume, takerBuyQuoteAssetVolume, ignore]
type BinanceKlineTuple = [
  number,  // openTime
  string,  // open
  string,  // high
  string,  // low
  string,  // close
  string,  // volume
  number,  // closeTime
  string,  // quoteAssetVolume
  number,  // numberOfTrades
  string,  // takerBuyBaseAssetVolume
  string,  // takerBuyQuoteAssetVolume
  string   // ignore
];

/**
 * Get kline/candlestick data
 */
export async function getKlines(
  symbol: string,
  interval: string = "1d",
  limit: number = 30
): Promise<BinanceKlineResponse[]> {
  const data = await fetchWithRetry<BinanceKlineTuple[]>(
    `${BINANCE_BASE_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );

  return data.map((kline) => ({
    openTime: kline[0],
    open: kline[1],
    high: kline[2],
    low: kline[3],
    close: kline[4],
    volume: kline[5],
    closeTime: kline[6],
    quoteAssetVolume: kline[7],
    numberOfTrades: kline[8],
    takerBuyBaseAssetVolume: kline[9],
    takerBuyQuoteAssetVolume: kline[10],
    ignore: kline[11],
  }));
}

/**
 * Get price data for a CoinGecko ID (converts to Binance symbol)
 */
export async function getPriceDataByCoinGeckoId(
  coinGeckoId: string
): Promise<BinancePriceData | null> {
  const symbol = getBinanceSymbol(coinGeckoId);

  if (!symbol) {
    console.log(`[Binance] No mapping found for CoinGecko ID: ${coinGeckoId}`);
    return null;
  }

  try {
    const ticker = await get24hrTicker(symbol);

    return {
      symbol,
      coinGeckoId,
      currentPrice: parseFloat(ticker.lastPrice),
      priceChange24h: parseFloat(ticker.priceChange),
      priceChangePercent24h: parseFloat(ticker.priceChangePercent),
      high24h: parseFloat(ticker.highPrice),
      low24h: parseFloat(ticker.lowPrice),
      volume24h: parseFloat(ticker.volume),
      quoteVolume24h: parseFloat(ticker.quoteVolume),
    };
  } catch (error) {
    console.error(`[Binance] Error fetching price for ${coinGeckoId}:`, error);
    return null;
  }
}

/**
 * Get prices for multiple CoinGecko IDs
 */
export async function getPricesByCoinGeckoIds(
  coinGeckoIds: string[]
): Promise<Record<string, number>> {
  const symbolsToFetch: string[] = [];
  const idToSymbol: Record<string, string> = {};

  // Map CoinGecko IDs to Binance symbols
  for (const id of coinGeckoIds) {
    const symbol = getBinanceSymbol(id);
    if (symbol) {
      symbolsToFetch.push(symbol);
      idToSymbol[id] = symbol;
    }
  }

  if (symbolsToFetch.length === 0) {
    return {};
  }

  try {
    const prices = await getPricesMultiple(symbolsToFetch);
    const result: Record<string, number> = {};

    // Map back to CoinGecko IDs
    for (const [id, symbol] of Object.entries(idToSymbol)) {
      const priceData = prices.find((p) => p.symbol === symbol);
      if (priceData) {
        result[id] = parseFloat(priceData.price);
      }
    }

    return result;
  } catch (error) {
    console.error("[Binance] Error fetching multiple prices:", error);
    return {};
  }
}

/**
 * Get market data for multiple CoinGecko IDs (similar to CoinGecko market endpoint)
 */
export async function getMarketDataByCoinGeckoIds(
  coinGeckoIds: string[]
): Promise<BinancePriceData[]> {
  const symbolsToFetch: string[] = [];
  const idToSymbol: Record<string, string> = {};

  // Map CoinGecko IDs to Binance symbols
  for (const id of coinGeckoIds) {
    const symbol = getBinanceSymbol(id);
    if (symbol) {
      symbolsToFetch.push(symbol);
      idToSymbol[id] = symbol;
    }
  }

  if (symbolsToFetch.length === 0) {
    return [];
  }

  try {
    const tickers = await get24hrTickerMultiple(symbolsToFetch);
    const results: BinancePriceData[] = [];

    // Map back to CoinGecko IDs
    for (const [id, symbol] of Object.entries(idToSymbol)) {
      const ticker = tickers.find((t) => t.symbol === symbol);
      if (ticker) {
        results.push({
          symbol,
          coinGeckoId: id,
          currentPrice: parseFloat(ticker.lastPrice),
          priceChange24h: parseFloat(ticker.priceChange),
          priceChangePercent24h: parseFloat(ticker.priceChangePercent),
          high24h: parseFloat(ticker.highPrice),
          low24h: parseFloat(ticker.lowPrice),
          volume24h: parseFloat(ticker.volume),
          quoteVolume24h: parseFloat(ticker.quoteVolume),
        });
      }
    }

    return results;
  } catch (error) {
    console.error("[Binance] Error fetching market data:", error);
    return [];
  }
}

/**
 * Check if Binance API is available
 */
export async function checkBinanceHealth(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout<{ serverTime: number }>(
      `${BINANCE_BASE_URL}/time`,
      5000
    );
    return !!response.serverTime;
  } catch {
    return false;
  }
}

/**
 * Get supported coin IDs (ones we have mappings for)
 */
export function getSupportedCoinIds(): string[] {
  return Object.keys(COINGECKO_TO_BINANCE_MAP);
}

/**
 * Check if a coin is supported by our Binance fallback
 */
export function isCoinSupported(coinGeckoId: string): boolean {
  return !!COINGECKO_TO_BINANCE_MAP[coinGeckoId.toLowerCase()];
}
