"use server"

import { registerUser, setSession } from "@/lib/auth"

export async function registerAction(name: string, email: string, password: string) {
  try {
    const result = await registerUser(name, email, password)

    if (result.success && result.userId) {
      // Set the session cookie to log the user in automatically
      setSession(result.userId)
    }

    return result
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

