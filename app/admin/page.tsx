export const dynamic = "force_dynamic"

import { redirect } from "next/navigation"

export default function AdminPage() {
  redirect("/admin/dashboard")
}

