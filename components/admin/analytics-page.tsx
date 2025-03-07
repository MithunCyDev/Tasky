"use client"

import { useEffect, useState } from "react"
import type { AdminData } from "@/lib/admin-auth"
import { AdminSidebar } from "./admin-sidebar"
import AdminHeader from "./admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
} from "recharts"
import { getTaskStats } from "@/lib/admin-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, PieChartIcon as ChartPie, Calendar, TrendingUp } from "lucide-react"
import type { TaskStats } from "@/lib/admin-types"

interface AdminAnalyticsPageProps {
  admin: AdminData
}

export default function AdminAnalyticsPage({ admin }: AdminAnalyticsPageProps) {
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const stats = await getTaskStats()
        setTaskStats(stats)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const statusData = taskStats
    ? [
        { name: "To Do", value: taskStats.todo },
        { name: "In Progress", value: taskStats.inProgress },
        { name: "Done", value: taskStats.completed },
      ]
    : []

  const platformData = taskStats
    ? Object.entries(taskStats.byPlatform).map(([name, value]) => ({
        name,
        value,
      }))
    : []

  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar admin={admin} />

      <div className="md:pl-64 transition-all duration-300">
        <AdminHeader title="Analytics" admin={admin} />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-500">View detailed statistics and insights</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-full mr-4">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                    <h3 className="text-2xl font-bold">{isLoading ? "..." : taskStats?.total || 0}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-50 rounded-full mr-4">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                    <h3 className="text-2xl font-bold">{isLoading ? "..." : taskStats?.inProgress || 0}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-full mr-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <h3 className="text-2xl font-bold">{isLoading ? "..." : taskStats?.completed || 0}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 rounded-full mr-4">
                    <ChartPie className="h-6 w-6 text-purple-600" />
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

          <Tabs defaultValue="status" className="space-y-6">
            <TabsList>
              <TabsTrigger value="status" className="inline-flex items-center gap-2">
                <ChartPie className="h-4 w-4" />
                Status Distribution
              </TabsTrigger>
              <TabsTrigger value="platform" className="inline-flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Platform Distribution
              </TabsTrigger>
            </TabsList>

            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Task Status Distribution</CardTitle>
                  <CardDescription>Overview of tasks by their current status</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : taskStats ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="platform">
              <Card>
                <CardHeader>
                  <CardTitle>Task Platform Distribution</CardTitle>
                  <CardDescription>Tasks by platform</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : platformData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Tasks" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No platform data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

