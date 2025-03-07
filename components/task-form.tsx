"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task, Status } from "@/lib/types"
import { createTask, updateTask } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { getAllUsers } from "@/lib/user-actions"

interface TaskFormProps {
  onSubmit: () => void
  onCancel: () => void
  initialData: Task | null
  platforms: string[]
}

export default function TaskForm({ onSubmit, onCancel, initialData, platforms }: TaskFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([])
  const [formData, setFormData] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    platform: platforms.length > 0 ? platforms[0] : "",
    subPlatform: "",
    status: "todo",
    assignee: "",
    dueDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        platform: initialData.platform,
        subPlatform: initialData.subPlatform,
        status: initialData.status,
        assignee: initialData.assignee,
        dueDate: new Date(initialData.dueDate).toISOString().split("T")[0],
      })
    } else if (platforms.length > 0 && !formData.platform) {
      setFormData((prev) => ({ ...prev, platform: platforms[0] }))
    }
  }, [initialData, platforms, formData.platform])

  // Fetch team members when the component mounts
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const users = await getAllUsers()
        setTeamMembers(users.map((user) => ({ id: user.id, name: user.name })))

        // If it's a new task and there are team members, set the default assignee
        if (!initialData && users.length > 0 && !formData.assignee) {
          setFormData((prev) => ({ ...prev, assignee: users[0].name }))
        }
      } catch (error) {
        console.error("Error fetching team members:", error)
      }
    }

    fetchTeamMembers()
  }, [initialData, formData.assignee])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      if (initialData) {
        const result = await updateTask({ ...formData, id: initialData.id })
        if (result.success) {
          setSuccess(result.message)
          toast({
            title: "Success",
            description: result.message,
          })
          setTimeout(() => {
            onSubmit()
          }, 2000)
        } else {
          setError(result.message)
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          })
        }
      } else {
        const result = await createTask(formData)
        if (result.success) {
          setSuccess(result.message)
          toast({
            title: "Success",
            description: result.message,
          })
          setTimeout(() => {
            onSubmit()
          }, 2000)
        } else {
          setError(result.message)
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSubPlatformOptions = () => {
    if (formData.platform === "Facebook") {
      return ["Orora FB Group", "FB page", "Other Page"]
    }
    return []
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="bg-emerald-50 text-emerald-800 border-emerald-200">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => handleSelectChange("platform", value)}
                disabled={platforms.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.length === 0 ? (
                    <SelectItem value="no-platforms" disabled>
                      No platforms available
                    </SelectItem>
                  ) : (
                    platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {formData.platform === "Facebook" && (
              <div className="space-y-2">
                <Label htmlFor="subPlatform">Sub Platform</Label>
                <Select
                  value={formData.subPlatform}
                  onValueChange={(value) => handleSelectChange("subPlatform", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubPlatformOptions().map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value as Status)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select value={formData.assignee} onValueChange={(value) => handleSelectChange("assignee", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.length === 0 ? (
                  <SelectItem value="no-members" disabled>
                    No team members available
                  </SelectItem>
                ) : (
                  teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || platforms.length === 0}
              className="bg-[#435AFF] hover:bg-[#3347cc] text-white"
            >
              {isSubmitting ? "Saving..." : initialData ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

