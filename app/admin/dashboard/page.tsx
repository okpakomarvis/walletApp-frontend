"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminService } from "@/lib/admin-service"
import type { DashboardStatsResponse } from "@/lib/types"
import { Users, Wallet, ArrowLeftRight, CheckCircle, XCircle, Clock, TrendingUp, Shield } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getDashboardStats()
        setStats(response.data)
      } catch (error) {
        console.error("[v0] Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: `${stats?.activeUsers} active`,
      color: "text-primary",
    },
    {
      title: "Total Wallets",
      value: stats?.totalWallets || 0,
      icon: Wallet,
      description: `${stats?.activeWallets} active`,
      color: "text-success",
    },
    {
      title: "Total Transactions",
      value: stats?.totalTransactions || 0,
      icon: ArrowLeftRight,
      description: `${stats?.transactionsLast24h} in 24h`,
      color: "text-primary",
    },
    {
      title: "Success Rate",
      value: stats?.totalTransactions
        ? `${Math.round((stats.successfulTransactions / stats.totalTransactions) * 100)}%`
        : "0%",
      icon: CheckCircle,
      description: `${stats?.successfulTransactions} successful`,
      color: "text-success",
    },
    {
      title: "Failed Transactions",
      value: stats?.failedTransactions || 0,
      icon: XCircle,
      description: "Requires attention",
      color: "text-destructive",
    },
    {
      title: "Pending Transactions",
      value: stats?.pendingTransactions || 0,
      icon: Clock,
      description: "Being processed",
      color: "text-warning",
    },
    {
      title: "Pending KYC",
      value: stats?.pendingKyc || 0,
      icon: Shield,
      description: "Awaiting review",
      color: "text-warning",
    },
    {
      title: "30-Day Volume",
      value: `$${((stats?.volumeLast30d || 0) / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
      description: `$${((stats?.volumeLast7d || 0) / 1000).toFixed(0)}K in 7d`,
      color: "text-primary",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {stats?.transactionsByType && Object.keys(stats.transactionsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.transactionsByType).map(([type, count]) => {
                const total = stats.totalTransactions || 1
                const percentage = Math.round((count / total) * 100)
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{type}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
