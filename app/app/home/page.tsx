"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { WalletCard } from "@/components/wallet-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth-service"
import { walletService } from "@/lib/wallet-service"
import { transactionService } from "@/lib/transaction-service"
import type { UserResponse, WalletResponse, TransactionResponse } from "@/lib/types"
import { StatusBadge } from "@/components/status-badge"
import { Plus, AlertCircle, Shield, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, ArrowLeftRight, Activity } from "@/components/icons" // Added imports for Wallet, ArrowLeftRight, and Activity

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [wallets, setWallets] = useState<WalletResponse[]>([])
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, walletsResponse, transactionsResponse] = await Promise.all([
          authService.getCurrentUser(),
          walletService.getWallets(),
          transactionService.getTransactions(0, 5),
        ])

        setUser(userResponse.data)
        setWallets(walletsResponse.data)
        setRecentTransactions(transactionsResponse.data.content)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-64" />
        </main>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} unreadCount={0} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 space-y-6 max-w-7xl">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}</h1>
          <p className="text-muted-foreground">Here's your financial overview</p>
        </div>

        {/* KYC Alert */}
        {user?.kycStatus !== "APPROVED" && (
          <Alert className="border-warning bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning-foreground" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-warning-foreground">
                {user?.kycStatus === "PENDING"
                  ? "Your verification is being reviewed"
                  : "Complete verification to unlock all features"}
              </span>
              {user?.kycStatus !== "PENDING" && (
                <Button variant="outline" size="sm" onClick={() => router.push("/app/kyc")}>
                  Verify Now
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* MFA Alert */}
        {!user?.mfaEnabled && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Enable two-factor authentication for better security</span>
              <Button variant="outline" size="sm" onClick={() => router.push("/app/security")}>
                Enable MFA
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Wallets Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Wallets</h2>
            <Button onClick={() => router.push("/app/wallets")}>
              <Plus className="mr-2 h-4 w-4" />
              New Wallet
            </Button>
          </div>

          {wallets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No wallets yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first wallet to start managing your funds
                </p>
                <Button onClick={() => router.push("/app/wallets")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Wallet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {wallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onViewDetails={() => router.push(`/app/wallets/${wallet.walletNumber}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 bg-transparent"
            onClick={() => router.push("/app/payments/transfer")}
          >
            <ArrowLeftRight className="h-6 w-6" />
            <span>Transfer Money</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 bg-transparent"
            onClick={() => router.push("/app/payments")}
          >
            <Plus className="h-6 w-6" />
            <span>Deposit Funds</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 bg-transparent"
            onClick={() => router.push("/app/activity")}
          >
            <Activity className="h-6 w-6" />
            <span>View Activity</span>
          </Button>
        </div>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/app/activity")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "DEPOSIT"
                            ? "bg-success/10"
                            : transaction.type === "WITHDRAWAL"
                              ? "bg-destructive/10"
                              : "bg-primary/10"
                        }`}
                      >
                        {transaction.type === "DEPOSIT" ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <ArrowLeftRight className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(transaction.amount, transaction.currency)}</p>
                      <StatusBadge status={transaction.status} type="transaction" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
