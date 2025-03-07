"use server"

import dbConnect from "./db-connect"
import User from "./models/user"
import Task from "./models/task"
import { requireAdmin } from "./admin-auth"
import type { UserStats, TaskStats, TaskWithUser, UserWithTaskCount } from "./admin-types"

// Get user statistics
export async function getUserStats(): Promise<UserStats> {
  await requireAdmin()
  await dbConnect()

  const totalUsers = await User.countDocuments()

  // Get active users (users with tasks in the last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const activeUsers = await User.countDocuments({
    _id: {
      $in: await Task.distinct("userId", { updatedAt: { $gte: thirtyDaysAgo } }),
    },
  })

  // Get new users (users created in the last 30 days)
  const newUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  })

  return {
    totalUsers,
    activeUsers,
    newUsers,
  }
}

// Get task statistics
export async function getTaskStats(): Promise<TaskStats> {
  await requireAdmin()
  await dbConnect()

  const total = await Task.countDocuments()
  const todo = await Task.countDocuments({ status: "todo" })
  const inProgress = await Task.countDocuments({ status: "in-progress" })
  const completed = await Task.countDocuments({ status: "done" })

  // Get task count by platform
  const platformCounts = await Task.aggregate([{ $group: { _id: "$platform", count: { $sum: 1 } } }])

  const byPlatform: Record<string, number> = {}
  platformCounts.forEach((item) => {
    byPlatform[item._id] = item.count
  })

  // Get task count by date (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const dailyCounts = await Task.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  const byDate = dailyCounts.map((item) => ({
    date: item._id,
    count: item.count,
  }))

  return {
    total,
    todo,
    inProgress,
    completed,
    byPlatform,
    byDate,
  }
}

// Get recent tasks with user information
export async function getRecentTasks(limit = 10): Promise<TaskWithUser[]> {
  await requireAdmin()
  await dbConnect()

  const tasks = await Task.find().sort({ createdAt: -1 }).limit(limit).lean()

  const userIds = tasks.map((task) => task.userId)
  const users = await User.find({ _id: { $in: userIds } }).lean()

  const userMap = new Map()
  users.forEach((user) => {
    userMap.set(user._id.toString(), {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    })
  })

  return tasks.map((task) => ({
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    platform: task.platform,
    subPlatform: task.subPlatform || "",
    status: task.status,
    assignee: task.assignee,
    dueDate: task.dueDate.toISOString(),
    createdAt: task.createdAt.toISOString(),
    user: userMap.get(task.userId.toString()) || null,
  }))
}

// Get users with most tasks
export async function getUsersWithMostTasks(limit = 5): Promise<UserWithTaskCount[]> {
  await requireAdmin()
  await dbConnect()

  const userTaskCounts = await Task.aggregate([
    {
      $group: {
        _id: "$userId",
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
        },
      },
    },
    { $sort: { totalTasks: -1 } },
    { $limit: limit },
  ])

  const userIds = userTaskCounts.map((item) => item._id)
  const users = await User.find({ _id: { $in: userIds } }).lean()

  const userMap = new Map()
  users.forEach((user) => {
    userMap.set(user._id.toString(), {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    })
  })

  return userTaskCounts
    .filter((item) => userMap.has(item._id.toString()))
    .map((item) => ({
      ...userMap.get(item._id.toString()),
      totalTasks: item.totalTasks,
      completedTasks: item.completedTasks,
    }))
}

// Get all users (for admin user management)
export async function getAllUsers(): Promise<
  {
    id: string
    name: string
    email: string
    createdAt: string
    taskCount: number
  }[]
> {
  await requireAdmin()
  await dbConnect()

  const users = await User.find().sort({ createdAt: -1 }).lean()

  // Get task counts for each user
  const userTaskCounts = await Task.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }])

  const taskCountMap = new Map()
  userTaskCounts.forEach((item) => {
    taskCountMap.set(item._id.toString(), item.count)
  })

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    taskCount: taskCountMap.get(user._id.toString()) || 0,
  }))
}

