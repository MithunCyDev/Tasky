import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, ListTodo, TrendingUp } from "lucide-react"
import type { Task } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

interface TaskStatsProps {
  tasks: Task[]
  isLoading: boolean
}

export default function TaskStats({ tasks, isLoading }: TaskStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalTasks = tasks.length
  const todoTasks = tasks.filter((task) => task.status === "todo").length
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length
  const doneTasks = tasks.filter((task) => task.status === "done").length
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: ListTodo,
      color: "bg-[#435AFF]/10 text-[#435AFF]",
      trend: "+5% from last week",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      trend: "Active tasks",
    },
    {
      title: "Completed",
      value: doneTasks,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600",
      trend: "Done this week",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
      trend: "Overall progress",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden transition-all hover:shadow-md hover:border-[#435AFF]/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

