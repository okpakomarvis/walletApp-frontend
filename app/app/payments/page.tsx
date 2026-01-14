"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/auth-service"
import type { UserResponse } from "@/lib/types"
import { ArrowLeftRight, Download, Upload, Clock } from "lucide-react"

export default function PaymentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserResponse | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await authService.getCurrentUser()
        setUser(userResponse.data)
      } catch (error) {
        console.error("[v0] Error fetching user:", error)
        router.push("/auth/login")
      }
    }
    fetchData()
  }, [router])

  const paymentOptions = [
    {
      title: "Transfer Money",
      description: "Send money to another wallet",
      icon: ArrowLeftRight,
      href: "/app/payments/transfer",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Deposit Funds",
      description: "Add money to your wallet",
      icon: Download,
      href: "/app/payments/deposit",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Withdraw Funds",
      description: "Transfer to your bank account",
      icon: Upload,
      href: "/app/payments/withdraw",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Scheduled Payments",
      description: "Manage recurring transfers",
      icon: Clock,
      href: "/app/payments/scheduled",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      disabled: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">Manage your transactions and transfers</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paymentOptions.map((option) => {
            const Icon = option.icon
            return (
              <Card
                key={option.title}
                className={`cursor-pointer transition-all hover:shadow-md ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !option.disabled && router.push(option.href)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-full ${option.bgColor} flex items-center justify-center mb-2`}>
                    <Icon className={`h-6 w-6 ${option.color}`} />
                  </div>
                  <CardTitle>{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
