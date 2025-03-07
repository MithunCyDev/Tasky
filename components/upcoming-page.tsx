"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, CalendarDays, ListTodo } from "lucide-react"
import { format, isSameDay, parseISO, isAfter } from "date-fns"
import { getUpcomingEvents } from "@/lib/admin-event-actions"
import { getTasksByPlatform } from "@/lib/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { UserData } from "@/lib/auth"
import type { Task } from "@/lib/types"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  imageUrl: string | null
}

interface UpcomingPageProps {
  user: UserData
}

export default function UpcomingPage({ user }: UpcomingPageProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoadingEvents(true)
        const data = await getUpcomingEvents(10) // Get more events for the dedicated page
        setEvents(data)
      } catch (error) {
        console.error("Error fetching upcoming events:", error)
      } finally {
        setIsLoadingEvents(false)
      }
    }

    const fetchTasks = async () => {
      try {
        setIsLoadingTasks(true)
        const data = await getTasksByPlatform("all")
        // Filter to only include upcoming tasks (due date is in the future)
        const upcomingTasks = data.filter(
          (task) => isAfter(new Date(task.dueDate), new Date()) || isSameDay(new Date(task.dueDate), new Date()),
        )
        setTasks(upcomingTasks)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setIsLoadingTasks(false)
      }
    }

    fetchEvents()
    fetchTasks()
  }, [])

  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString)
    return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a")
  }

  const formatTaskDueDate = (dateString: string) => {
    const date = parseISO(dateString)
    return format(date, "EEEE, MMMM d, yyyy")
  }

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

  // Group events by date
  const groupedEvents = events.reduce(
    (groups, event) => {
      const date = format(parseISO(event.date), "yyyy-MM-dd")
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
      return groups
    },
    {} as Record<string, Event[]>,
  )

  // Group tasks by due date
  const groupedTasks = tasks.reduce(
    (groups, task) => {
      const date = format(parseISO(task.dueDate), "yyyy-MM-dd")
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(task)
      return groups
    },
    {} as Record<string, Task[]>,
  )

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events & Tasks</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Tasks
          </TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Events Column */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Events scheduled for the coming days</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingEvents ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No upcoming events at the moment</p>
                    <p className="text-sm">Check back later for new events</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedEvents).map(([date, dateEvents]) => (
                      <div key={date}>
                        <h3 className="font-medium text-sm text-gray-500 mb-2">
                          {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                        </h3>
                        <div className="space-y-4">
                          {dateEvents.map((event) => (
                            <div
                              key={event.id}
                              className="flex gap-4 group border rounded-md p-3 hover:border-blue-200 transition-colors"
                            >
                              <div className="min-w-[60px] h-[60px] rounded-md overflow-hidden">
                                {event.imageUrl ? (
                                  <img
                                    src={event.imageUrl || "/placeholder.svg"}
                                    alt={event.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white">
                                    <Calendar className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                                  {event.title}
                                </h3>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {format(parseISO(event.date), "h:mm a")}
                                </div>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {event.location}
                                </div>
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasks Column */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Tasks due in the coming days</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTasks ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ListTodo className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No upcoming tasks at the moment</p>
                    <p className="text-sm">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedTasks).map(([date, dateTasks]) => (
                      <div key={date}>
                        <h3 className="font-medium text-sm text-gray-500 mb-2">
                          {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                        </h3>
                        <div className="space-y-4">
                          {dateTasks.map((task) => (
                            <div
                              key={task.id}
                              className="border rounded-md p-3 hover:border-blue-200 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium">{task.title}</h3>
                                {getStatusBadge(task.status)}
                              </div>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Badge variant="secondary" className="mr-2">
                                  {task.platform}
                                </Badge>
                                {task.subPlatform && <Badge variant="outline">{task.subPlatform}</Badge>}
                              </div>
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                <span>Assigned to: {task.assignee}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>All Upcoming Events</CardTitle>
              <CardDescription>Detailed view of all scheduled events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No upcoming events at the moment</p>
                  <p className="text-sm">Check back later for new events</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedEvents).map(([date, dateEvents]) => (
                    <div key={date}>
                      <h3 className="font-medium text-lg text-gray-800 mb-4 border-b pb-2">
                        {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dateEvents.map((event) => (
                          <Card key={event.id} className="overflow-hidden">
                            {event.imageUrl ? (
                              <div className="h-40 w-full overflow-hidden">
                                <img
                                  src={event.imageUrl || "/placeholder.svg"}
                                  alt={event.title}
                                  className="h-full w-full object-cover transition-transform hover:scale-105"
                                />
                              </div>
                            ) : (
                              <div className="h-40 w-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white">
                                <Calendar className="h-12 w-12 opacity-50" />
                              </div>
                            )}
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <Clock className="h-4 w-4 mr-2" />
                                {format(parseISO(event.date), "h:mm a")}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mb-4">
                                <MapPin className="h-4 w-4 mr-2" />
                                {event.location}
                              </div>
                              <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>All Upcoming Tasks</CardTitle>
              <CardDescription>Detailed view of all upcoming tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTasks ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ListTodo className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No upcoming tasks at the moment</p>
                  <p className="text-sm">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedTasks).map(([date, dateTasks]) => (
                    <div key={date}>
                      <h3 className="font-medium text-lg text-gray-800 mb-4 border-b pb-2">
                        {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                      </h3>
                      <div className="space-y-4">
                        {dateTasks.map((task) => (
                          <Card key={task.id} className="overflow-hidden">
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
                                    <span className="text-muted-foreground">Assigned to: {task.assignee}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

