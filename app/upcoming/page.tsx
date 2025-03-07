export const dynamic = "force-dynamic"

import { requireAuth } from "@/lib/auth"
import UpcomingPage from "@/components/upcoming-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Upcoming Events & Tasks | Ororasoft Task Management",
  description: "View all your upcoming events and tasks",
}

export default async function Upcoming() {
  // This will redirect to login if not authenticated
  const user = await requireAuth()

  return <UpcomingPage user={user} />
}

