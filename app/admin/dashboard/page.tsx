export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin-auth"
import AdminDashboard from "@/components/admin/admin-dashboard"

export const metadata: Metadata = {
  title: "Admin Dashboard | Ororasoft Task Management",
  description: "Admin portal for Ororasoft Task Management system",
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin()

  return <AdminDashboard admin={admin} />
}

