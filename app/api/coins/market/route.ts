import { getMarketCoins } from "@/services/coingecko";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const per_page = Number(searchParams.get("per_page") || 20);

  const data = await getMarketCoins({ page, per_page });
  return Response.json(data);
}
