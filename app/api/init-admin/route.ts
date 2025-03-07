import { NextResponse } from "next/server"
import { createAdmin } from "@/lib/admin-auth"

export async function GET() {
  try {
    // Create the admin account with the specified credentials
    const result = await createAdmin("Admin User", "mithuncy1@gmail.com", "01757271080")

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Admin account created successfully",
        adminEmail: "mithuncy1@gmail.com",
        adminPassword: "01757271080", // In a real app, you wouldn't return the password
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
      })
    }
  } catch (error) {
    console.error("Error creating admin account:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

