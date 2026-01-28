export type Credentials = {
    email: string;
    password: string;
};

export interface MarketCoin {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap?: number;
    market_cap_rank?: number;
    total_volume?: number;
    price_change_percentage_24h?: number;
    circulating_supply?: number;
    total_supply?: number | null;
}

export interface TrendingItem {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank?: number | null;
    thumb?: string;
    large?: string;
    score?: number;
}

export interface TrendingResponse {
    coins: { item: TrendingItem }[];
}

export interface CoinDetails {
    id: string;
    symbol: string;
    name: string;
    description?: { [lang: string]: string };
    image?: { thumb?: string; small?: string; large?: string };
    market_data?: {
        current_price?: Record<string, number>;
        market_cap?: Record<string, number>;
        total_volume?: Record<string, number>;
        price_change_percentage_24h?: number;
        circulating_supply?: number;
        total_supply?: number | null;
        market_cap_rank?: number | null;
        high_24h?: Record<string, number>;
        low_24h?: Record<string, number>;
        ath?: Record<string, number>;
    };
    links?: {
        homepage?: string[];
        blockchain_site?: string[];
        [key: string]: any;
    };
}

export interface Favorite {
    _id?: string;
    userId: string;
    coinId: string;
    chainId: string;
    address: string;
    createdAt?: string;
    updatedAt?: string;
}