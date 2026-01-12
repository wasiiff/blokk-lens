import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import User from "@/models/User";
import z from "zod";

const schema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);
    await connectDB()
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return Response.json(
            { error: "User already exists" },
            { status: 400 }
        );
    }

    const hashedPassword = await hashPassword(password);
    const savedUser = await User.create({ name, email, password: hashedPassword, provider: "credentials" });
    return Response.json({ success: true });

}