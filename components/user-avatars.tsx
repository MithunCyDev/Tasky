"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllUsers } from "@/lib/user-actions"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export default function UserAvatars() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const fetchedUsers = await getAllUsers()
        setUsers(fetchedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 items-center mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-10 rounded-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Team Members</h3>
      <div className="flex flex-wrap gap-3 items-center">
        {users.map((user) => (
          <div key={user.id} className="flex flex-col items-center">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="text-xs mt-1 text-gray-600">{user.name.split(" ")[0]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

