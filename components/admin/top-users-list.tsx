import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { UserWithTaskCount } from "@/lib/admin-types"

interface TopUsersListProps {
  users: UserWithTaskCount[]
  isLoading: boolean
}

export function TopUsersList({ users, isLoading }: TopUsersListProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
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

  if (users.length === 0) {
    return <div className="text-center py-6 text-gray-500">No user data available</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Tasks</TableHead>
          <TableHead>Completed</TableHead>
          <TableHead>Completion Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
              </div>
            </TableCell>
            <TableCell>{user.totalTasks}</TableCell>
            <TableCell>{user.completedTasks}</TableCell>
            <TableCell>{Math.round((user.completedTasks / (user.totalTasks || 1)) * 100)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

