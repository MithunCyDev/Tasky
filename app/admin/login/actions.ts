"use server"

import { loginAdmin, setAdminSession } from "@/lib/admin-auth"

export async function loginAdminAction(email: string, password: string) {
  const result = await loginAdmin(email, password)

  if (result.success && result.admin) {
    // Set the admin session cookie
    setAdminSession(result.admin._id)
  }

  return result
}

