import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "./db";
import User from "@/models/User";
import { verifyPassword } from "./password";
import { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { Credentials } from "@/types/types";
export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials: Credentials | undefined) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing Credentials");
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email }).select("+password");

                if (!user || !user.password) {
                    throw new Error("Invalid Email or Password");
                }

                const isValid = await verifyPassword(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                } as any;
            },

        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            await connectDB();

            if (account?.provider === "google") {
                const existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    await User.create({
                        name: user.name,
                        email: user.email,
                        provider: "google",
                    });
                }
            }
            return true;
        },

        async jwt({ token }: { token: JWT }) {
            await connectDB();
            const dbUser = await User.findOne({ email: token.email });
            if (dbUser) token.id = dbUser._id.toString();
            return token as JWT;
        },

        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                (session.user as any).id = token.id as string | undefined;
            }
            return session;
        },
    },

};