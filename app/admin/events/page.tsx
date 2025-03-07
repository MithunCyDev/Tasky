export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin-auth"
import AdminEventsPage from "@/components/admin/events-page"

export const metadata: Metadata = {
  title: "Manage Events | Admin Dashboard",
  description: "Create and manage upcoming events for users",
}

export default async function AdminEvents() {
  const admin = await requireAdmin()

  return <AdminEventsPage admin={admin} />
}

