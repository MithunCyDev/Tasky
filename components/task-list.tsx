"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Clock, CheckSquare } from "lucide-react"
import type { Task, Status } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface TaskListProps {
  tasks: (Task & { userName?: string })[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (task: Task, status: Status) => void
  isLoading: boolean
}

export default function TaskList({ tasks, onEdit, onDelete, onStatusChange, isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No tasks found</p>
      </div>
    )
  }

  const getStatusActions = (task: Task) => {
    switch (task.status) {
      case "todo":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(task, "in-progress")}
            className="flex items-center gap-1 border-amber-500 text-amber-600 hover:bg-amber-50"
          >
            <Clock className="h-4 w-4" />
            Start
          </Button>
        )
      case "in-progress":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(task, "done")}
            className="flex items-center gap-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          >
            <CheckSquare className="h-4 w-4" />
            Complete
          </Button>
        )
      case "done":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(task, "todo")}
            className="flex items-center gap-1 border-[#435AFF] text-[#435AFF] hover:bg-[#435AFF]/10"
          >
            <Clock className="h-4 w-4" />
            Reopen
          </Button>
        )
    }
  }

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "todo":
        return (
          <Badge variant="outline" className="border-[#435AFF] text-[#435AFF]">
            To Do
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            In Progress
          </Badge>
        )
      case "done":
        return (
          <Badge variant="default" className="bg-emerald-600">
            Done
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="overflow-hidden hover:border-[#435AFF]/30 transition-all">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  {getStatusBadge(task.status)}
                </div>
                <p className="text-muted-foreground text-sm">{task.description}</p>
                <div className="flex flex-wrap gap-2 items-center text-sm">
                  <Badge variant="secondary">{task.platform}</Badge>
                  {task.subPlatform && <Badge variant="outline">{task.subPlatform}</Badge>}
                  <span className="text-muted-foreground">Due {formatDistanceToNow(new Date(task.dueDate))}</span>
                  <span className="text-muted-foreground">Assigned to: {task.assignee}</span>
                  {task.userName && <span className="text-muted-foreground">Created by: {task.userName}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-center">
                {getStatusActions(task)}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(task)}
                  className="text-[#435AFF] hover:bg-[#435AFF]/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(task.id)}
                  className="text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

