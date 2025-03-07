"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "./db-connect"
import Event from "./models/event"
import { requireAdmin } from "./admin-auth"

// Create a new event
export async function createEvent(eventData: {
  title: string
  description: string
  date: string
  location: string
  imageUrl?: string
}) {
  const admin = await requireAdmin()
  await dbConnect()

  try {
    const newEvent = await Event.create({
      ...eventData,
      date: new Date(eventData.date),
      createdBy: admin._id,
    })

    revalidatePath("/admin/events")
    revalidatePath("/dashboard")
    revalidatePath("/upcoming")

    return {
      success: true,
      message: "Event created successfully",
      eventId: newEvent._id.toString(),
    }
  } catch (error) {
    console.error("Error creating event:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create event",
    }
  }
}

// Update an event
export async function updateEvent(
  id: string,
  eventData: {
    title: string
    description: string
    date: string
    location: string
    imageUrl?: string
  },
) {
  await requireAdmin()
  await dbConnect()

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        ...eventData,
        date: new Date(eventData.date),
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedEvent) {
      return {
        success: false,
        message: "Event not found",
      }
    }

    revalidatePath("/admin/events")
    revalidatePath("/dashboard")
    revalidatePath("/upcoming")

    return {
      success: true,
      message: "Event updated successfully",
    }
  } catch (error) {
    console.error("Error updating event:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update event",
    }
  }
}

// Get all events
export async function getAllEvents(timestamp?: number) {
  await dbConnect()

  const events = await Event.find().sort({ date: 1 }).lean()

  return events.map((event) => ({
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    location: event.location,
    imageUrl: event.imageUrl || null,
    createdAt: event.createdAt.toISOString(),
  }))
}

// Get upcoming events
export async function getUpcomingEvents(limit = 3, timestamp?: number) {
  await dbConnect()

  const now = new Date()
  const events = await Event.find({ date: { $gte: now } })
    .sort({ date: 1 })
    .limit(limit)
    .lean()

  return events.map((event) => ({
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    location: event.location,
    imageUrl: event.imageUrl || null,
  }))
}

// Delete an event
export async function deleteEvent(id: string) {
  await requireAdmin()
  await dbConnect()

  try {
    const deletedEvent = await Event.findByIdAndDelete(id)

    if (!deletedEvent) {
      return {
        success: false,
        message: "Event not found",
      }
    }

    revalidatePath("/admin/events")
    revalidatePath("/dashboard")
    revalidatePath("/upcoming")

    return {
      success: true,
      message: "Event deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting event:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete event",
    }
  }
}

