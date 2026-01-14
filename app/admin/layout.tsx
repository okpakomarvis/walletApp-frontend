"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AppHeader } from "@/components/app-header"
import { authService } from "@/lib/auth-service"
import type { UserResponse } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser()
        const userData = response.data

        if (!userData.roles.includes("ADMIN")) {
          router.push("/app/home")
          return
        }

        setUser(userData)
      } catch (error) {
        console.error("[v0] Error checking auth:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
