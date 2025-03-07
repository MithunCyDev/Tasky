// User statistics
export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsers: number
}

// Task statistics
export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  completed: number
  byPlatform: Record<string, number>
  byDate: {
    date: string
    count: number
  }[]
}

// Task with user information
export interface TaskWithUser {
  id: string
  title: string
  description: string
  platform: string
  subPlatform: string
  status: string
  assignee: string
  dueDate: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  } | null
}

// User with task count
export interface UserWithTaskCount {
  id: string
  name: string
  email: string
  totalTasks: number
  completedTasks: number
}

