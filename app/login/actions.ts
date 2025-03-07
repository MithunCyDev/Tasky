"use server"

import { loginUser, setSession } from "@/lib/auth"

export async function loginAction(email: string, password: string) {
  try {
    const result = await loginUser(email, password)

    if (result.success && result.user) {
      // Set the session cookie
      setSession(result.user._id)
    }

    return result
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

