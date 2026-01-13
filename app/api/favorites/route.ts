import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { favoriteSchema } from "@/lib/validators/favorite";
import Favorites from "@/models/Favorites";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            error: "Unauthorized"
        }, { status: 401 })
    }

    await connectDB();
    const favorites = await Favorites.find({ UserId: session.user.id })
    return Response.json(favorites);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            error: "Unauthorized"
        }, { status: 401 })
    }
    const body = await req.json();
    const data = favoriteSchema.parse(body);

    await connectDB();

    const addedFav = await Favorites.create({
        UserId: session.user.id,
        ...data,
    })

    return Response.json(addedFav);

}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            error: "Unauthorized"
        }, { status: 401 })
    }

    const { searchParams } = new URL(req.url);
    const coinId = searchParams.get("coinId")

    const deletedFav = await Favorites.findOneAndDelete({
        coinId,
        userId: session.user.id,
    });
    return Response.json({ success: true });
}