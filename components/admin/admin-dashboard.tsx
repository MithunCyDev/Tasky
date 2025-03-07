"use client"

import { useEffect, useState } from "react"
import type { AdminData } from "@/lib/admin-auth"
import { AdminSidebar } from "./admin-sidebar"
import AdminHeader from "./admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CheckCircle, Clock, BarChart3, TrendingUp, CalendarDays } from "lucide-react"
import { getUserStats, getTaskStats, getRecentTasks, getUsersWithMostTasks } from "@/lib/admin-actions"
import type { UserStats, TaskStats, TaskWithUser, UserWithTaskCount } from "@/lib/admin-types"
import { DashboardChart } from "./dashboard-chart"
import { RecentTasksList } from "./recent-tasks-list"
import { TopUsersList } from "./top-users-list"

interface AdminDashboardProps {
  admin: AdminData
}

export default function AdminDashboard({ admin }: AdminDashboardProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [recentTasks, setRecentTasks] = useState<TaskWithUser[]>([])
  const [topUsers, setTopUsers] = useState<UserWithTaskCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const [userStatsData, taskStatsData, recentTasksData, topUsersData] = await Promise.all([
          getUserStats(),
          getTaskStats(),
          getRecentTasks(),
          getUsersWithMostTasks(),
        ])

        setUserStats(userStatsData)
        setTaskStats(taskStatsData)
        setRecentTasks(recentTasksData)
        setTopUsers(topUsersData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar admin={admin} />

      <div className="md:pl-64 transition-all duration-300">
        <AdminHeader title="Dashboard" admin={admin} />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Welcome, {admin.name}</h1>
            <p className="text-gray-500">Here's what's happening with your team today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-full mr-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <h3 className="text-2xl font-bold">{isLoading ? "..." : userStats?.totalUsers || 0}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-full mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
                    <h3 className="text-2xl font-bold">{isLoading ? "..." : taskStats?.completed || 0}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-50 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                    <h3 className="text-2xl font-bold">
                      {isLoading ? "..." : (taskStats?.inProgress || 0) + (taskStats?.todo || 0)}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 rounded-full mr-4">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                    <h3 className="text-2xl font-bold">
                      {isLoading
                        ? "..."
                        : taskStats
                          ? `${Math.round((taskStats.completed / (taskStats.total || 1)) * 100)}%`
                          : "0%"}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview" className="inline-flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="recent" className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Recent Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Distribution Chart */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Task Status Distribution</CardTitle>
                    <CardDescription>Overview of tasks by their current status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DashboardChart
                      isLoading={isLoading}
                      data={
                        taskStats
                          ? [
                              { name: "To Do", value: taskStats.todo },
                              { name: "In Progress", value: taskStats.inProgress },
                              { name: "Completed", value: taskStats.completed },
                            ]
                          : []
                      }
                    />
                  </CardContent>
                </Card>

                {/* Top Users Table */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Top Users</CardTitle>
                    <CardDescription>Users with most assigned tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TopUsersList users={topUsers} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>Latest tasks created across all users</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTasksList tasks={recentTasks} isLoading={isLoading} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

