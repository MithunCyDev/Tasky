"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  ListTodo,
  BarChart,
  Settings,
  LogOut,
  ChevronLast,
  ChevronFirst,
  Menu,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { logoutAdminAction } from "@/app/admin/actions"
import { useToast } from "@/components/ui/use-toast"
import type { AdminData } from "@/lib/admin-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SidebarProps {
  admin: AdminData
}

export function AdminSidebar({ admin }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleLogout = async () => {
    await logoutAdminAction()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out of the admin panel.",
    })
    router.push("/admin/login")
  }

  // Update the sidebarItems array to ensure all routes are correct
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      title: "Tasks",
      href: "/admin/tasks",
      icon: <ListTodo size={20} />,
    },
    {
      title: "Events",
      href: "/admin/events",
      icon: <Calendar size={20} />,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart size={20} />,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings size={20} />,
    },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        <Menu />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white border-r transition-all duration-300 shadow-md",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b">
            {!collapsed && <div className="font-bold text-xl">Admin Panel</div>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={collapsed ? "mx-auto" : ""}
            >
              {collapsed ? <ChevronLast size={20} /> : <ChevronFirst size={20} />}
            </Button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1 px-2">
              {sidebarItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center py-2 px-3 rounded-md transition-colors",
                      pathname === item.href ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100",
                      collapsed ? "justify-center" : "justify-start",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User section */}
          <div className="border-t py-4 px-4">
            <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
              <div className={cn("flex items-center", collapsed ? "flex-col" : "")}>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="ml-3">
                    <p className="font-medium text-sm">{admin.name}</p>
                    <p className="text-xs text-gray-500">{admin.role}</p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut size={18} />
                </Button>
              )}
            </div>
            {collapsed && (
              <Button variant="ghost" size="icon" onClick={handleLogout} className="w-full mt-2" title="Logout">
                <LogOut size={18} />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

