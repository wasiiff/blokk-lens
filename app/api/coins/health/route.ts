import { NextResponse } from "next/server";
import { getServiceHealth } from "@/services/crypto-service";

export async function GET() {
  try {
    const health = await getServiceHealth();

    return NextResponse.json({
      status: "ok",
      services: {
        coingecko: {
          status: health.coingecko ? "healthy" : "degraded",
          available: health.coingecko,
        },
        binance: {
          status: health.binance ? "healthy" : "degraded",
          available: health.binance,
        },
      },
      fallbackEnabled: true,
      message: health.coingecko
        ? "All services operational"
        : health.binance
        ? "Using Binance fallback - CoinGecko unavailable"
        : "All external services unavailable - using cache",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("[Health API] Error:", error);

    return NextResponse.json(
      {
        status: "error",
        services: {
          coingecko: { status: "unknown", available: false },
          binance: { status: "unknown", available: false },
        },
        fallbackEnabled: true,
        message: "Health check failed",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
