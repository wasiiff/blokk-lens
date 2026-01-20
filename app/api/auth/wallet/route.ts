import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import { hashPassword } from "@/lib/password"

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }

    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not configured")
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      )
    }

    await connectDB()

    const normalizedAddress = walletAddress.toLowerCase()
    const walletEmail = `${normalizedAddress}@wallet.blokklens`

    // Check if user exists with this wallet address
    let user = await User.findOne({ 
      email: walletEmail
    })

    // If user doesn't exist, create one
    if (!user) {
      // Hash the wallet address to use as password
      const hashedPassword = await hashPassword(normalizedAddress)
      
      user = await User.create({
        name: `User ${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`,
        email: walletEmail,
        password: hashedPassword,
        walletAddress: normalizedAddress,
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
      },
    })
  } catch (error: any) {
    console.error("Wallet auth error:", error)
    
    // Provide more specific error messages
    if (error.name === 'MongooseServerSelectionError' || error.code === 'ETIMEOUT') {
      return NextResponse.json(
        { error: "Database connection timeout. Please check your MongoDB configuration." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to authenticate wallet" },
      { status: 500 }
    )
  }
}
