import { NextResponse } from "next/server"
import { setupDatabase } from "@/lib/db-schema"
import { registerUser } from "@/lib/auth"

export async function GET() {
  try {
    // First, set up the database schema
    const setupResult = await setupDatabase()

    if (!setupResult.success) {
      return NextResponse.json({ message: "Database setup failed", error: setupResult.error }, { status: 500 })
    }

    // Create a demo user
    const demoUser = await registerUser("Demo User", "demo@example.com", "password123")

    if (!demoUser.success) {
      return NextResponse.json({ message: "Failed to create demo user", error: demoUser.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "Database and demo user setup completed successfully",
      demoUser: {
        email: "demo@example.com",
        password: "password123",
      },
    })
  } catch (error) {
    console.error("Error in setup-users route:", error)
    return NextResponse.json({ message: "Internal server error", error }, { status: 500 })
  }
}

