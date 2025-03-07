"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { getUpcomingEvents } from "@/lib/admin-event-actions"
import { Skeleton } from "@/components/ui/skeleton"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  imageUrl: string | null
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime()
        const data = await getUpcomingEvents(3, timestamp)
        setEvents(data)
      } catch (error) {
        console.error("Error fetching upcoming events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid date"
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Stay updated with our latest events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Stay updated with our latest events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No upcoming events at the moment</p>
            <p className="text-sm">Check back later for new events</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Stay updated with our latest events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex gap-4 group hover:bg-[#435AFF]/5 p-2 rounded-md transition-colors">
              <div className="min-w-[60px] h-[60px] rounded-md overflow-hidden">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl || "/placeholder.svg"}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-[#435AFF] to-[#6478FF] flex items-center justify-center text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium group-hover:text-[#435AFF] transition-colors">{event.title}</h3>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatEventDate(event.date)}
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {event.location}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#435AFF]"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

