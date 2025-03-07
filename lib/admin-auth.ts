import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import dbConnect from "./db-connect"
import Admin from "./models/admin"

export interface AdminData {
  _id: string
  name: string
  email: string
  role: string
}

// Admin login
export async function loginAdmin(
  email: string,
  password: string,
): Promise<{ success: boolean; message: string; admin?: AdminData }> {
  try {
    await dbConnect()

    // Find the admin
    const admin = await Admin.findOne({ email })

    if (!admin) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, admin.password)

    if (!passwordMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Return admin without password
    const adminData: AdminData = {
      _id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    }

    return {
      success: true,
      message: "Login successful",
      admin: adminData,
    }
  } catch (error) {
    console.error("Error logging in admin:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to login",
    }
  }
}

// Create admin (use this to initialize the first admin)
export async function createAdmin(
  name: string,
  email: string,
  password: string,
): Promise<{ success: boolean; message: string; adminId?: string }> {
  try {
    await dbConnect()

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email })

    if (existingAdmin) {
      return {
        success: false,
        message: "Admin with this email already exists",
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the new admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    })

    return {
      success: true,
      message: "Admin created successfully",
      adminId: admin._id.toString(),
    }
  } catch (error) {
    console.error("Error creating admin:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create admin",
    }
  }
}

// Set admin session
export function setAdminSession(adminId: string) {
  cookies().set("admin_session", adminId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })
}

// Get current admin
export async function getCurrentAdmin(): Promise<AdminData | null> {
  try {
    await dbConnect()

    const sessionId = cookies().get("admin_session")?.value

    if (!sessionId) {
      return null
    }

    const admin = await Admin.findById(sessionId).select("-password")

    if (!admin) {
      return null
    }

    return {
      _id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    }
  } catch (error) {
    console.error("Error getting current admin:", error)
    return null
  }
}

// Logout admin
export function logoutAdmin() {
  cookies().delete("admin_session")
}

// Middleware to check if user is authenticated as admin
export async function requireAdmin() {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect("/admin/login")
  }

  return admin
}

