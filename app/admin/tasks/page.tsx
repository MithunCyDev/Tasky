export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin-auth"
import AdminTasksPage from "@/components/admin/tasks-page"

export const metadata: Metadata = {
  title: "Manage Tasks | Admin Dashboard",
  description: "View and manage all tasks in the system",
}

export default async function AdminTasks() {
  const admin = await requireAdmin()

  return <AdminTasksPage admin={admin} />
}

