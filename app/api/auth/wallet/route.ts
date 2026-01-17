import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user exists with this wallet address
    let user = await User.findOne({ 
      email: `${walletAddress.toLowerCase()}@wallet.blokklens` 
    })

    // If user doesn't exist, create one
    if (!user) {
      user = await User.create({
        name: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        email: `${walletAddress.toLowerCase()}@wallet.blokklens`,
        password: walletAddress, // Using wallet address as password
        walletAddress: walletAddress.toLowerCase(),
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
  } catch (error) {
    console.error("Wallet auth error:", error)
    return NextResponse.json(
      { error: "Failed to authenticate wallet" },
      { status: 500 }
    )
  }
}
