export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin-auth"
import AdminSettingsPage from "@/components/admin/settings-page"

export const metadata: Metadata = {
  title: "Admin Settings | Admin Dashboard",
  description: "Manage system settings and configurations",
}

export default async function AdminSettings() {
  const admin = await requireAdmin()

  return <AdminSettingsPage admin={admin} />
}

