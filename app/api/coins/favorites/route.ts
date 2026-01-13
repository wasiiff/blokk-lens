import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Favorite from "@/models/Favorites";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const favorites = await Favorite.find({ userId: session.user.id });

    const ids = favorites.map((f) => f.coinId).join(",");

    if (!ids) return Response.json([]);

    const res = await fetch(
        `${process.env.COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}`
    );

    const data = await res.json();
    return Response.json(data);
}
