import { NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import User from "@/lib/models/user"
import Task from "@/lib/models/task"
import { registerUser } from "@/lib/auth"
import mongoose from "mongoose"
import { initDefaultPlatforms } from "@/lib/platform-actions"

export async function GET() {
  try {
    await dbConnect()
    console.log("Connected to MongoDB database: orora")

    // Initialize default platforms
    await initDefaultPlatforms()

    // Create a demo user if none exists
    const userCount = await User.countDocuments()
    let demoUser

    if (userCount === 0) {
      const result = await registerUser("Demo User", "demo@example.com", "password123")
      if (result.success && result.userId) {
        demoUser = {
          _id: result.userId,
          email: "demo@example.com",
          password: "password123",
        }
      }
    } else {
      const user = await User.findOne().select("_id email")
      demoUser = {
        _id: user._id.toString(),
        email: user.email,
        password: "password123 (original password not retrievable)",
      }
    }

    // Create sample tasks if none exist
    const taskCount = await Task.countDocuments()
    let tasksCreated = 0

    if (taskCount === 0 && demoUser) {
      const userId = new mongoose.Types.ObjectId(demoUser._id)

      const sampleTasks = [
        {
          title: "Post weekly update",
          description: "Share company updates on the Orora FB Group",
          platform: "Facebook",
          subPlatform: "Orora FB Group",
          status: "todo",
          assignee: "John Doe",
          dueDate: new Date(Date.now() + 86400000 * 2),
          userId,
        },
        {
          title: "Respond to comments",
          description: "Reply to user comments on our latest LinkedIn post",
          platform: "LinkedIn",
          subPlatform: "",
          status: "in-progress",
          assignee: "Jane Smith",
          dueDate: new Date(Date.now() + 86400000),
          userId,
        },
        {
          title: "Schedule tweets for the week",
          description: "Prepare and schedule content for Twitter",
          platform: "Twitter",
          subPlatform: "",
          status: "done",
          assignee: "Alex Johnson",
          dueDate: new Date(Date.now() - 86400000),
          userId,
        },
      ]

      await Task.insertMany(sampleTasks)
      tasksCreated = sampleTasks.length
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      demoUser,
      tasksCreated,
    })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initialize database",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

