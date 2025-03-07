import { NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import User from "@/lib/models/user"
import { registerUser } from "@/lib/auth"

export async function GET() {
  try {
    // Connect to MongoDB
    await dbConnect()

    // Check if there are already users in the database
    const userCount = await User.countDocuments()

    if (userCount === 0) {
      // Create a demo user
      await registerUser("Demo User", "demo@example.com", "password123")
    }

    return NextResponse.json({ message: "Database seeded successfully" })
  } catch (error) {
    console.error("Error in seed-db route:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

