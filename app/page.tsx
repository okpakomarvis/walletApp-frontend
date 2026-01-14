"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth-service"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/app/home")
    } else {
      router.push("/auth/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
