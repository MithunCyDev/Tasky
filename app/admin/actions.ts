"use server"

import { logoutAdmin } from "@/lib/admin-auth"
import { revalidatePath } from "next/cache"

export async function logoutAdminAction() {
  logoutAdmin()
  revalidatePath("/admin")
  return { success: true }
}

