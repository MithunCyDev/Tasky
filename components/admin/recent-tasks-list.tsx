import { formatDistanceToNow } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { TaskWithUser } from "@/lib/admin-types"

interface RecentTasksListProps {
  tasks: TaskWithUser[]
  isLoading: boolean
}

export function RecentTasksList({ tasks, isLoading }: RecentTasksListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "todo":
        return <Badge variant="outline">To Do</Badge>
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>
      case "done":
        return <Badge variant="default">Done</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    )
  }

  if (tasks.length === 0) {
    return <div className="text-center py-6 text-gray-500">No recent tasks found</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Platform</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell>{task.user?.name || "Unknown"}</TableCell>
            <TableCell>{task.platform}</TableCell>
            <TableCell>{getStatusBadge(task.status)}</TableCell>
            <TableCell>{formatDistanceToNow(new Date(task.createdAt))} ago</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

