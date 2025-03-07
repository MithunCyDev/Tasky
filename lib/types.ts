export type Status = "todo" | "in-progress" | "done"

export interface Task {
  id: string
  title: string
  description: string
  platform: string
  subPlatform: string
  status: Status
  assignee: string
  dueDate: string
}

