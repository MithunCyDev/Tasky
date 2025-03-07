"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "./db-connect"
import Task from "./models/task"
import { getCurrentUser } from "./auth"
import type { Status, Task as TaskType } from "./types"
import User from "./models/user"

// Helper function to convert MongoDB document to Task type
function convertToTaskType(doc: any): TaskType {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    platform: doc.platform,
    subPlatform: doc.subPlatform || "",
    status: doc.status,
    assignee: doc.assignee,
    dueDate: doc.dueDate.toISOString(),
  }
}

// Create a new task
export async function createTask(
  task: Omit<TaskType, "id">,
): Promise<{ success: boolean; message: string; task?: TaskType }> {
  try {
    await dbConnect()

    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to create a task",
      }
    }

    const newTask = await Task.create({
      ...task,
      userId: user._id,
      dueDate: new Date(task.dueDate),
    })

    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Task created successfully",
      task: convertToTaskType(newTask),
    }
  } catch (error) {
    console.error("Error creating task:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create task",
    }
  }
}

// Update an existing task
export async function updateTask(task: TaskType): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect()

    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to update a task",
      }
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: task.id, userId: user._id },
      {
        title: task.title,
        description: task.description,
        platform: task.platform,
        subPlatform: task.subPlatform || "",
        status: task.status,
        assignee: task.assignee,
        dueDate: new Date(task.dueDate),
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedTask) {
      return {
        success: false,
        message: "Task not found or you do not have permission to update it",
      }
    }

    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Task updated successfully",
    }
  } catch (error) {
    console.error("Error updating task:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update task",
    }
  }
}

// Get tasks by platform
export async function getTasksByPlatform(platform: string): Promise<(TaskType & { userName?: string })[]> {
  try {
    await dbConnect()

    const user = await getCurrentUser()
    if (!user) {
      return []
    }

    const query: any = {}

    if (platform !== "all") {
      query.platform = platform
    }

    // Fetch all tasks
    const tasks = await Task.find(query).sort({ dueDate: 1 })

    // Get all unique user IDs from the tasks
    const userIds = [...new Set(tasks.map((task) => task.userId.toString()))]

    // Fetch user information for all task creators
    const users = await User.find({ _id: { $in: userIds } })
      .select("_id name")
      .lean()

    // Create a map of user IDs to names
    const userMap = new Map()
    users.forEach((user) => {
      userMap.set(user._id.toString(), user.name)
    })

    // Convert tasks to TaskType and add userName
    return tasks.map((task) => {
      const taskObj = convertToTaskType(task)
      return {
        ...taskObj,
        userName: userMap.get(task.userId.toString()) || "Unknown User",
      }
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return []
  }
}

// Update task status
export async function updateTaskStatus(id: string, status: Status): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect()

    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to update a task",
      }
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId: user._id },
      { status, updatedAt: new Date() },
      { new: true },
    )

    if (!updatedTask) {
      return {
        success: false,
        message: "Task not found or you do not have permission to update it",
      }
    }

    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Task status updated successfully",
    }
  } catch (error) {
    console.error("Error updating task status:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update task status",
    }
  }
}

// Delete a task
export async function deleteTask(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect()

    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to delete a task",
      }
    }

    const deletedTask = await Task.findOneAndDelete({ _id: id, userId: user._id })

    if (!deletedTask) {
      return {
        success: false,
        message: "Task not found or you do not have permission to delete it",
      }
    }

    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Task deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting task:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete task",
    }
  }
}

