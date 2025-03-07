export const dynamic = "force-dynamic"

import { requireAuth } from "@/lib/auth"
import SettingsPage from "@/components/settings-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account Settings | Ororasoft Task Management",
  description: "Manage your account settings and preferences",
}

export default async function Settings() {
  // This will redirect to login if not authenticated
  const user = await requireAuth()

  return <SettingsPage user={user} />
}

