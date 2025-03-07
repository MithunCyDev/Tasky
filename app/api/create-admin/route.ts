import { NextResponse } from "next/server"
import { createAdmin } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
    const { name, email, password, secretKey } = await request.json()

    // Verify the secret key (this is a simple security measure)
    // In production, use a more secure approach or environment variables
    if (secretKey !== "your-super-secret-init-key") {
      return NextResponse.json({ success: false, message: "Invalid secret key" }, { status: 401 })
    }

    const result = await createAdmin(name, email, password)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

