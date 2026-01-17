import { api } from "./api";
import {
  MarketCoin,
  TrendingResponse,
  CoinDetails,
  Favorite,
} from "@/types/types";

/* ======================
   COINS
====================== */

export const fetchMarketCoins = (page: number = 1, per_page: number = 20) =>
  api<MarketCoin[]>(`/api/coins/market?page=${page}&per_page=${per_page}`);

export const searchMarketCoins = (query: string) =>
  api<{ coins: Array<{ id: string; name: string; symbol: string; market_cap_rank: number; thumb: string; large: string }> }>(`/api/coins/search?query=${encodeURIComponent(query)}`);

export const fetchTrendingCoins = () =>
  api<TrendingResponse>("/api/coins/trending");

export const fetchCoinDetails = (id: string) =>
  api<CoinDetails>(`/api/coins/${id}`);

export const fetchGlobalMarketData = () =>
  api<{
    data: {
      total_market_cap: { usd: number };
      total_volume: { usd: number };
      market_cap_percentage: { [key: string]: number };
      market_cap_change_percentage_24h_usd: number;
    };
  }>("/api/coins/global");

/* ======================
   FAVORITES
====================== */

export const fetchFavorites = () =>
  api<MarketCoin[]>("/api/coins/favorites");

export const addFavorite = (coinId: string) =>
  api<Favorite>("/api/favorites", {
    method: "POST",
    body: JSON.stringify({ coinId, chainId: "ethereum", address: "0x0" }),
  });

export const removeFavorite = (coinId: string) =>
  api<{ success: boolean }>(`/api/favorites?coinId=${coinId}`, {
    method: "DELETE",
  });
