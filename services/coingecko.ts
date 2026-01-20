const BASE_URL = process.env.COINGECKO_BASE_URL!;

async function fetcher(url: string) {
    const res = await fetch(url, {
        headers: {
            "Accept": "application/json",
        },
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error("CoinGecko API error");
    }

    return res.json();
}

export async function getTrendingCoins() {
    return fetcher(`${BASE_URL}/search/trending`);
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
        `${BASE_URL}/coins/markets?vs_currency=${vs_currency}&order=market_cap_desc&per_page=${per_page}&page=${page}&sparkline=false`
    );
}

export async function getGlobalData() {
    return fetcher(`${BASE_URL}/global`);
}


export async function getCoinDetails(id: string) {
    return fetcher(
        `${BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true`
    );
}

export async function searchCoins(query: string) {
    return fetcher(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
}