"use server"

import dbConnect from "./db-connect"
import Platform from "./models/platform"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"

// Get all platforms
export async function getAllPlatforms(): Promise<string[]> {
  try {
    await dbConnect()

    const platforms = await Platform.find().sort({ name: 1 })
    return platforms.map((platform) => platform.name)
  } catch (error) {
    console.error("Error fetching platforms:", error)
    return []
  }
}

// Add a new platform
export async function addPlatform(name: string): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect()

    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to add a platform",
      }
    }

    // Check if platform already exists
    const existingPlatform = await Platform.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
    if (existingPlatform) {
      return {
        success: false,
        message: "Platform already exists",
      }
    }

    // Create new platform
    await Platform.create({ name })

    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Platform added successfully",
    }
  } catch (error) {
    console.error("Error adding platform:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add platform",
    }
  }
}

// Remove a platform
export async function removePlatform(name: string): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect()

    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to remove a platform",
      }
    }

    await Platform.findOneAndDelete({ name })

    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Platform removed successfully",
    }
  } catch (error) {
    console.error("Error removing platform:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to remove platform",
    }
  }
}

// Initialize default platforms if none exist
export async function initDefaultPlatforms(): Promise<void> {
  try {
    await dbConnect()

    const count = await Platform.countDocuments()

    if (count === 0) {
      const defaultPlatforms = ["Facebook", "LinkedIn", "Twitter", "Medium", "Dev.to", "Quora"]

      for (const platform of defaultPlatforms) {
        await Platform.create({ name: platform })
      }

      console.log("Default platforms initialized")
    }
  } catch (error) {
    console.error("Error initializing default platforms:", error)
  }
}

