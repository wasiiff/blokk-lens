import { getCoinDetails } from "@/services/coingecko";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await getCoinDetails(params.id);
  return Response.json(data);
}
