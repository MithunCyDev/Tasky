export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin-auth"
import AdminAnalyticsPage from "@/components/admin/analytics-page"

export const metadata: Metadata = {
  title: "Analytics | Admin Dashboard",
  description: "View detailed analytics and statistics",
}

export default async function AdminAnalytics() {
  const admin = await requireAdmin()

  return <AdminAnalyticsPage admin={admin} />
}

