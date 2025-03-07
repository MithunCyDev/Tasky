"use server"

import { logout } from "@/lib/auth"

export async function logoutAction() {
  logout()
  return { success: true }
}

