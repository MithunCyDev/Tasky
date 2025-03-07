"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Clock, CheckSquare, Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TaskList from "@/components/task-list"
import TaskForm from "@/components/task-form"
import TaskStats from "@/components/task-stats"
import type { Task, Status } from "@/lib/types"
import { getTasksByPlatform, updateTaskStatus, deleteTask } from "@/lib/actions"
import { getAllPlatforms, addPlatform, removePlatform } from "@/lib/platform-actions"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import UpcomingEvents from "@/components/upcoming-events"
import UserAvatars from "@/components/user-avatars"

export default function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPlatformDialogOpen, setIsPlatformDialogOpen] = useState(false)
  const [newPlatformName, setNewPlatformName] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Fetch platforms and tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch platforms
        const fetchedPlatforms = await getAllPlatforms()
        setPlatforms(fetchedPlatforms)

        // Fetch tasks
        const fetchedTasks = await getTasksByPlatform(activeFilter === "all" ? "all" : activeFilter)
        setTasks(fetchedTasks)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [activeFilter, toast])

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleFormClose = async () => {
    setIsFormOpen(false)
    setEditingTask(null)

    // Refetch tasks after form close
    try {
      setIsLoading(true)
      const fetchedTasks = await getTasksByPlatform(activeFilter === "all" ? "all" : activeFilter)
      setTasks(fetchedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (task: Task, status: Status) => {
    try {
      await updateTaskStatus(task.id, status)
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status } : t)))
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id)
      setTasks(tasks.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const handleAddPlatform = async () => {
    if (!newPlatformName.trim()) {
      toast({
        title: "Error",
        description: "Platform name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await addPlatform(newPlatformName.trim())

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })

        // Refresh platforms list
        const fetchedPlatforms = await getAllPlatforms()
        setPlatforms(fetchedPlatforms)

        // Reset form
        setNewPlatformName("")
        setIsPlatformDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding platform:", error)
      toast({
        title: "Error",
        description: "Failed to add platform. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemovePlatform = async (platformName: string) => {
    try {
      const result = await removePlatform(platformName)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })

        // Refresh platforms list
        const fetchedPlatforms = await getAllPlatforms()
        setPlatforms(fetchedPlatforms)

        // Reset active filter if the removed platform was selected
        if (activeFilter === platformName) {
          setActiveFilter("all")
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing platform:", error)
      toast({
        title: "Error",
        description: "Failed to remove platform. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const todoTasks = filteredTasks.filter((task) => task.status === "todo")
  const inProgressTasks = filteredTasks.filter((task) => task.status === "in-progress")
  const doneTasks = filteredTasks.filter((task) => task.status === "done")

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Task Management</h1>
          <p className="text-muted-foreground">Manage your team's social media tasks in one place.</p>
        </div>
        <Button
          onClick={() => {
            setIsFormOpen(true)
            setEditingTask(null)
          }}
          size="sm"
          className="md:self-center bg-[#435AFF] hover:bg-[#3347cc] text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Task
        </Button>
      </div>

      <TaskStats tasks={tasks} isLoading={isLoading} />

      {/* Team Members Section */}
      <UserAvatars />

      {/* Upcoming Events Section */}
      <div className="mb-6">
        <UpcomingEvents />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlatformDialogOpen(true)}
              title="Manage Platforms"
              className="border-[#435AFF] text-[#435AFF] hover:bg-[#435AFF]/10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm font-medium mb-2">Platforms:</div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={activeFilter === "all" ? "default" : "outline"}
              className={`cursor-pointer ${activeFilter === "all" ? "bg-[#435AFF] hover:bg-[#3347cc]" : "hover:border-[#435AFF] hover:text-[#435AFF]"}`}
              onClick={() => setActiveFilter("all")}
            >
              All Platforms
            </Badge>
            {platforms.map((platform) => (
              <Badge
                key={platform}
                variant={activeFilter === platform ? "default" : "outline"}
                className={`cursor-pointer ${activeFilter === platform ? "bg-[#435AFF] hover:bg-[#3347cc]" : "hover:border-[#435AFF] hover:text-[#435AFF]"}`}
                onClick={() => setActiveFilter(platform)}
              >
                {platform}
              </Badge>
            ))}
          </div>
        </div>

        <Tabs defaultValue="todo" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger
              value="todo"
              className="flex items-center gap-2 data-[state=active]:bg-[#435AFF] data-[state=active]:text-white"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden md:inline">To Do</span>
              <span className="bg-blue-100 text-[#435AFF] px-2 py-0.5 rounded-full text-xs">{todoTasks.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="flex items-center gap-2 data-[state=active]:bg-[#435AFF] data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">In Progress</span>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                {inProgressTasks.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="done"
              className="flex items-center gap-2 data-[state=active]:bg-[#435AFF] data-[state=active]:text-white"
            >
              <CheckSquare className="h-4 w-4" />
              <span className="hidden md:inline">Done</span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{doneTasks.length}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="todo">
            <TaskList
              tasks={todoTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="in-progress">
            <TaskList
              tasks={inProgressTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="done">
            <TaskList
              tasks={doneTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {isFormOpen && (
        <TaskForm
          onSubmit={handleFormClose}
          onCancel={handleFormClose}
          initialData={editingTask}
          platforms={platforms}
        />
      )}

      {/* Platform Management Dialog */}
      <Dialog open={isPlatformDialogOpen} onOpenChange={setIsPlatformDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Platforms</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="platformName">Add New Platform</Label>
                <Input
                  id="platformName"
                  placeholder="Enter platform name"
                  value={newPlatformName}
                  onChange={(e) => setNewPlatformName(e.target.value)}
                />
              </div>
              <Button onClick={handleAddPlatform} className="bg-[#435AFF] hover:bg-[#3347cc] text-white">
                Add
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Current Platforms</Label>
              <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {platforms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No platforms added yet</p>
                ) : (
                  platforms.map((platform) => (
                    <div key={platform} className="flex items-center justify-between">
                      <span>{platform}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePlatform(platform)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPlatformDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

