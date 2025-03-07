"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "./db-connect"
import User from "./models/user"
import bcrypt from "bcryptjs"
import { getCurrentUser } from "./auth"

// Update user profile
export async function updateUserProfile({
  name,
}: {
  name: string
}): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: "You must be logged in to update your profile",
      }
    }

    // Update user profile
    await User.findByIdAndUpdate(
      currentUser._id,
      {
        name,
        updatedAt: new Date(),
      },
      { new: true },
    )

    revalidatePath("/settings")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Profile updated successfully",
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update profile",
    }
  }
}

// Change user password
export async function changeUserPassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string
  newPassword: string
}): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: "You must be logged in to change your password",
      }
    }

    // Get user with password
    const user = await User.findById(currentUser._id)
    if (!user) {
      return {
        success: false,
        message: "User not found",
      }
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Current password is incorrect",
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await User.findByIdAndUpdate(
      currentUser._id,
      {
        password: hashedPassword,
        updatedAt: new Date(),
      },
      { new: true },
    )

    return {
      success: true,
      message: "Password changed successfully",
    }
  } catch (error) {
    console.error("Error changing user password:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to change password",
    }
  }
}

// Update user avatar
export async function updateUserAvatar({
  avatarUrl,
}: {
  avatarUrl: string
}): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect()

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: "You must be logged in to update your avatar",
      }
    }

    // Update user avatar
    await User.findByIdAndUpdate(
      currentUser._id,
      {
        avatar: avatarUrl,
        updatedAt: new Date(),
      },
      { new: true },
    )

    revalidatePath("/settings")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Profile image updated successfully",
    }
  } catch (error) {
    console.error("Error updating user avatar:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update profile image",
    }
  }
}

// Get all users
export async function getAllUsers(): Promise<{ id: string; name: string; email: string; avatar?: string }[]> {
  try {
    await dbConnect()

    // Ensure the user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return []
    }

    // Fetch all users
    const users = await User.find().select("_id name email avatar").lean()

    return users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }))
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

