import { NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"

export async function GET() {
  try {
    // Connect to MongoDB
    await dbConnect()

    return NextResponse.json({ message: "Database connection successful" })
  } catch (error) {
    console.error("Error in setup-db route:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

