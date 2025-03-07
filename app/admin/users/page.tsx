export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin-auth"
import AdminUsersPage from "@/components/admin/users-page"

export const metadata: Metadata = {
  title: "Manage Users | Admin Dashboard",
  description: "Manage all users of the Ororasoft Task Management system",
}

export default async function AdminUsers() {
  const admin = await requireAdmin()

  return <AdminUsersPage admin={admin} />
}

