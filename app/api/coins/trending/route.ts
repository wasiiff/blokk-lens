import { getTrendingCoins } from "@/services/coingecko";

export async function GET() {
  const data = await getTrendingCoins();
  return Response.json(data);
}
