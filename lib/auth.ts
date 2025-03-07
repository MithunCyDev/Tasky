import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import dbConnect from "./db-connect"
import User from "./models/user"
import mongoose from "mongoose"

export interface UserData {
  _id: string
  name: string
  email: string
  avatar?: string
}

// Generate avatar URL based on name
function generateAvatar(name: string) {
  // Use DiceBear API to generate avatar
  const formattedName = encodeURIComponent(name.trim())
  return `https://api.dicebear.com/7.x/initials/svg?seed=${formattedName}`
}

// Register a new user
export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate avatar
    const avatar = generateAvatar(name)

    // Create the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
    })

    return {
      success: true,
      message: "User registered successfully",
      userId: user._id.toString(),
    }
  } catch (error) {
    console.error("Error registering user:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to register user",
    }
  }
}

// Login a user
export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; message: string; user?: UserData }> {
  try {
    await dbConnect()

    // Find the user
    const user = await User.findOne({ email })

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Return user without password
    const userData: UserData = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }

    return {
      success: true,
      message: "Login successful",
      user: userData,
    }
  } catch (error) {
    console.error("Error logging in user:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to login",
    }
  }
}

// Set session cookie
export function setSession(userId: string) {
  cookies().set("session", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })
}

// Get current user
export async function getCurrentUser(): Promise<UserData | null> {
  try {
    await dbConnect()

    const sessionId = cookies().get("session")?.value

    if (!sessionId) {
      return null
    }

    // Check if sessionId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return null
    }

    const user = await User.findById(sessionId).select("-password")

    if (!user) {
      return null
    }

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Logout user
export function logout() {
  cookies().delete("session")
}

// Middleware to check if user is authenticated
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

