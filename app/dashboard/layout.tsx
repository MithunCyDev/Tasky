export const dynamic = "force-dynamic"

import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { requireAuth } from "@/lib/auth"
import Header from "@/components/header"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ororasoft Task Management",
  description: "Manage your team's social media tasks efficiently",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect to login if not authenticated
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} />
      <main className="container mx-auto p-4 md:p-8">{children}</main>
      <Toaster />
    </div>
  )
}

