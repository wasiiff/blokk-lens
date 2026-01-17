import { NextResponse } from "next/server";

const BASE_URL = process.env.COINGECKO_BASE_URL!;

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/global`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
      throw new Error("CoinGecko API error");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching global market data:", error);
    return NextResponse.json(
      { error: "Failed to fetch global market data" },
      { status: 500 }
    );
  }
}
