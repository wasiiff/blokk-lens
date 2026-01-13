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

export const fetchMarketCoins = () =>
  api<MarketCoin[]>("/api/coins/markets");

export const fetchTrendingCoins = () =>
  api<TrendingResponse>("/api/coins/trending");

export const fetchCoinDetails = (id: string) =>
  api<CoinDetails>(`/api/coins/${id}`);

/* ======================
   FAVORITES
====================== */

export const fetchFavorites = () =>
  api<Favorite[]>("/api/favorites/coins");

export const addFavorite = (coinId: string) =>
  api<Favorite>("/api/favorites", {
    method: "POST",
    body: JSON.stringify({ coinId }),
  });

export const removeFavorite = (coinId: string) =>
  api<{ success: boolean }>(`/api/favorites?coinId=${coinId}`, {
    method: "DELETE",
  });
