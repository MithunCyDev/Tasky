"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { AdminData } from "@/lib/admin-auth"
import { AdminSidebar } from "./admin-sidebar"
import AdminHeader from "./admin-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, Plus, Pencil, Trash2 } from "lucide-react"
import { getAllEvents, createEvent, updateEvent, deleteEvent } from "@/lib/admin-event-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  imageUrl: string | null
  createdAt: string
}

interface AdminEventsPageProps {
  admin: AdminData
}

export default function AdminEventsPage({ admin }: AdminEventsPageProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    imageUrl: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      // Format the date properly for datetime-local input
      // It needs to be in the format: YYYY-MM-DDThh:mm
      const eventDate = new Date(selectedEvent.date)
      const formattedDate = eventDate.toISOString().slice(0, 16)

      setFormData({
        title: selectedEvent.title,
        description: selectedEvent.description,
        date: formattedDate,
        location: selectedEvent.location,
        imageUrl: selectedEvent.imageUrl || "",
      })
    } else {
      // For new events, set the current date and time
      const now = new Date()
      const formattedDate = now.toISOString().slice(0, 16)

      setFormData({
        title: "",
        description: "",
        date: formattedDate,
        location: "",
        imageUrl: "",
      })
    }
  }, [selectedEvent])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime()
      const data = await getAllEvents(timestamp)
      setEvents(data)
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString)
        return "Date unavailable"
      }

      // Format the date in Bangladesh timezone
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(date)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Date unavailable"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Create a Date object from the form input
      const inputDate = new Date(formData.date)

      // Ensure it's a valid date
      if (isNaN(inputDate.getTime())) {
        setError("Invalid date format")
        return
      }

      const eventData = {
        ...formData,
        date: inputDate.toISOString(), // Convert to ISO string for consistent timezone handling
      }

      if (selectedEvent) {
        const result = await updateEvent(selectedEvent.id, eventData)
        if (result.success) {
          toast({
            title: "Success",
            description: "Event updated successfully",
          })
          setIsDialogOpen(false)
          await fetchEvents()
        } else {
          setError(result.message)
        }
      } else {
        const result = await createEvent(eventData)
        if (result.success) {
          toast({
            title: "Success",
            description: "Event created successfully",
          })
          setIsDialogOpen(false)
          await fetchEvents()
        } else {
          setError(result.message)
        }
      }
    } catch (error) {
      console.error("Error saving event:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEvent) return

    setIsSubmitting(true)
    try {
      const result = await deleteEvent(selectedEvent.id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        fetchEvents()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar admin={admin} />

      <div className="md:pl-64 transition-all duration-300">
        <AdminHeader title="Event Management" admin={admin} />

        <main className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Upcoming Events</h1>
              <p className="text-gray-500">Create and manage events for your users</p>
            </div>

            <Button
              onClick={() => {
                setSelectedEvent(null)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No events have been created yet</p>
              <Button
                onClick={() => {
                  setSelectedEvent(null)
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Event
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
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
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatEventDate(event.date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{event.description}</p>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(event)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setSelectedEvent(event)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Event Date & Time</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Select the date and time for the event</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter event location"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter event description"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="Enter image URL"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : selectedEvent ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            {selectedEvent && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{selectedEvent.title}</p>
                <p className="text-sm text-gray-500">{formatEventDate(selectedEvent.date)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

