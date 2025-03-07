import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Admin Dashboard | Ororasoft Task Management",
  description: "Admin portal for Ororasoft Task Management system",
}

// Mark this route as dynamic to avoid static generation errors with cookies
export const dynamic = "force_dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The window check was causing server-side rendering issues
  return (
    <div className={inter.className}>
      {children}
      <Toaster />
    </div>
  )
}

