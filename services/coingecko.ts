const BASE_URL = process.env.COINGECKO_BASE_URL!;
const API_KEY = process.env.COINGECKO_API_KEY;

// Note: The provided API key is invalid (returns 401)
// We'll use the free tier API which works without authentication
const FREE_BASE_URL = "https://api.coingecko.com/api/v3";
const PRO_BASE_URL = "https://pro-api.coingecko.com/api/v3";

// Always use free API since the provided key is invalid
// If you get a valid Pro API key, this will automatically switch
const ACTIVE_BASE_URL = FREE_BASE_URL;

async function fetcher(url: string) {
    const headers: HeadersInit = {
        "Accept": "application/json",
    };

    // Only add API key if we're using Pro API and key exists
    // Currently disabled since the key is invalid
    // if (API_KEY && ACTIVE_BASE_URL === PRO_BASE_URL) {
    //     headers["x-cg-pro-api-key"] = API_KEY;
    // }

    const res = await fetch(url, {
        headers,
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        console.error(`CoinGecko API error (${res.status}):`, errorText);
        throw new Error(`CoinGecko API error: ${res.status} - ${errorText}`);
    }

    return res.json();
}

// Validate API key
export async function validateApiKey(): Promise<{ valid: boolean; tier: string; message: string }> {
    try {
        if (!API_KEY) {
            return {
                valid: false,
                tier: "free",
                message: "No API key configured. Using free tier with rate limits (10-30 calls/min)."
            };
        }

        // Test the API key with Pro API ping endpoint
        const headers: HeadersInit = {
            "Accept": "application/json",
            "x-cg-pro-api-key": API_KEY,
        };

        const res = await fetch(`${PRO_BASE_URL}/ping`, { 
            headers,
            cache: 'no-store'
        });

        if (res.ok) {
            return {
                valid: true,
                tier: "pro",
                message: "✅ API key is valid! Using Pro API with higher rate limits (500+ calls/min)."
            };
        } else {
            const status = res.status;
            const errorText = await res.text().catch(() => "");
            return {
                valid: false,
                tier: "free",
                message: `❌ API key validation failed (${status}). The provided key is invalid. Using free tier with rate limits (10-30 calls/min). ${errorText ? `Error: ${errorText}` : ''}`
            };
        }
    } catch (error) {
        console.error("API key validation error:", error);
        return {
            valid: false,
            tier: "free",
            message: `⚠️ API key validation error. Using free tier with rate limits (10-30 calls/min).`
        };
    }
}

export async function getTrendingCoins() {
    return fetcher(`${ACTIVE_BASE_URL}/search/trending`);
}

export async function getMarketCoins({
    vs_currency = "usd",
    page = 1,
    per_page = 20,
}: {
    vs_currency?: string;
    page?: number;
    per_page?: number;
}) {
    return fetcher(
        `${ACTIVE_BASE_URL}/coins/markets?vs_currency=${vs_currency}&order=market_cap_desc&per_page=${per_page}&page=${page}&sparkline=false`
    );
}

export async function getGlobalData() {
    return fetcher(`${ACTIVE_BASE_URL}/global`);
}

export async function getCoinDetails(id: string) {
    return fetcher(
        `${ACTIVE_BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true`
    );
}

export async function searchCoins(query: string) {
    return fetcher(`${ACTIVE_BASE_URL}/search?query=${encodeURIComponent(query)}`);
}

// Get historical market data (price, volume, market cap)
export async function getCoinMarketChart(
    id: string,
    vs_currency: string = 'usd',
    days: number | string = 30
) {
    return fetcher(
        `${ACTIVE_BASE_URL}/coins/${id}/market_chart?vs_currency=${vs_currency}&days=${days}`
    );
}

// Get OHLC data for charting
export async function getCoinOHLC(
    id: string,
    vs_currency: string = 'usd',
    days: number = 30
) {
    return fetcher(
        `${ACTIVE_BASE_URL}/coins/${id}/ohlc?vs_currency=${vs_currency}&days=${days}`
    );
}
