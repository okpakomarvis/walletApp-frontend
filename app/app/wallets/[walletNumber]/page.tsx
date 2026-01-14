"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/status-badge"
import { walletService } from "@/lib/wallet-service"
import { transactionService } from "@/lib/transaction-service"
import { authService } from "@/lib/auth-service"
import type { WalletResponse, TransactionResponse, UserResponse } from "@/lib/types"
import { ArrowLeft, Copy, Eye, EyeOff, Snowflake, Sun, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function WalletDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const walletNumber = params.walletNumber as string

  const [user, setUser] = useState<UserResponse | null>(null)
  const [wallet, setWallet] = useState<WalletResponse | null>(null)
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [walletNumber, currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [userResponse, walletsResponse] = await Promise.all([
        authService.getCurrentUser(),
        walletService.getWallets(),
      ])

      setUser(userResponse.data)
      const foundWallet = walletsResponse.data.find((w) => w.walletNumber === walletNumber)

      if (!foundWallet) {
        toast({
          title: "Error",
          description: "Wallet not found",
          variant: "destructive",
        })
        router.push("/app/wallets")
        return
      }

      setWallet(foundWallet)

      // Fetch transactions for this wallet
      const transactionsResponse = await transactionService.getTransactions(currentPage, 10)

      // Filter transactions to show only those related to this specific wallet
      const walletTransactions = transactionsResponse.data.content.filter(
        (txn) => txn.sourceWalletNumber === walletNumber || txn.destinationWalletNumber === walletNumber,
      )

      setTransactions(walletTransactions)
      setTotalPages(transactionsResponse.data.totalPages)
    } catch (error) {
      console.error("Error fetching wallet details:", error)
      toast({
        title: "Error",
        description: "Failed to load wallet details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "N/A"

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "N/A"
    }
  }

  const copyWalletNumber = () => {
    navigator.clipboard.writeText(walletNumber)
    toast({
      title: "Copied!",
      description: "Wallet number copied to clipboard",
    })
  }

  const handleFreezeToggle = async () => {
    if (!wallet) return

    try {
      setActionLoading(true)
      if (wallet.status === "ACTIVE") {
        await walletService.freezeWallet(wallet.id)
        toast({
          title: "Success",
          description: "Wallet has been frozen",
        })
      } else if (wallet.status === "FROZEN") {
        await walletService.unfreezeWallet(wallet.id)
        toast({
          title: "Success",
          description: "Wallet has been unfrozen",
        })
      }
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wallet status",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "ALL" || transaction.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </main>
        <MobileNav />
      </div>
    )
  }

  if (!wallet) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} unreadCount={0} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Wallet Details</h1>
            <p className="text-muted-foreground">Manage your {wallet.currency} wallet</p>
          </div>
        </div>

        {/* Wallet Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Wallet Information</CardTitle>
              <StatusBadge status={wallet.status} type="wallet" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Balance Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Balance</p>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold">
                    {showBalance ? formatCurrency(wallet.balance, wallet.currency) : "••••••"}
                  </p>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowBalance(!showBalance)}>
                    {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                <p className="text-2xl font-bold text-success">
                  {showBalance ? formatCurrency(wallet.availableBalance, wallet.currency) : "••••••"}
                </p>
              </div>
            </div>

            {/* Wallet Details */}
            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Wallet Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono font-semibold">{wallet.walletNumber}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyWalletNumber}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Currency</p>
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {wallet.currency}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Created</p>
                <p className="text-lg font-medium">{formatDate(wallet.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                <p className="text-lg font-medium">{formatDate(wallet.updatedAt)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
              {user?.roles.includes("ADMIN") && (
                <Button
                  variant={wallet.status === "ACTIVE" ? "destructive" : "default"}
                  onClick={handleFreezeToggle}
                  disabled={actionLoading || wallet.status === "INACTIVE"}
                >
                  {wallet.status === "ACTIVE" ? (
                    <>
                      <Snowflake className="mr-2 h-4 w-4" />
                      Freeze Wallet
                    </>
                  ) : (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Unfreeze Wallet
                    </>
                  )}
                </Button>
              )}

              <Button variant="outline" onClick={() => router.push("/app/payments/transfer")}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Transfer Money
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <Input
                placeholder="Search by reference or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:max-w-xs"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REVERSED">Reversed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-4 border-b last:border-0">
                    <div>
                      <p className="font-semibold">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">{transaction.reference}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(transaction.amount, transaction.currency)}</p>
                      <StatusBadge status={transaction.status} type="transaction" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  )
}
