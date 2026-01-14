"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { authService } from "@/lib/auth-service"
import { transactionService } from "@/lib/transaction-service"
import type { UserResponse, TransactionResponse, PageResponse } from "@/lib/types"
import { Loader2, ArrowLeftRight, Download, Upload, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ActivityPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [pageInfo, setPageInfo] = useState<PageResponse<TransactionResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [filterType, setFilterType] = useState("ALL")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [userResponse, transactionsResponse] = await Promise.all([
          authService.getCurrentUser(),
          transactionService.getTransactions(currentPage, 20),
        ])

        setUser(userResponse.data)
        setPageInfo(transactionsResponse.data)
        setTransactions(transactionsResponse.data.content)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, currentPage])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return Download
      case "WITHDRAWAL":
        return Upload
      case "TRANSFER":
      default:
        return ArrowLeftRight
    }
  }

  const filteredTransactions = filterType === "ALL" ? transactions : transactions.filter((t) => t.type === filterType)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transaction Activity</h1>
            <p className="text-muted-foreground mt-1">View all your transactions</p>
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
              <SelectItem value="DEPOSIT">Deposit</SelectItem>
              <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTransactions.map((transaction) => {
                      const Icon = getTransactionIcon(transaction.type)
                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between py-4 px-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                          onClick={() => router.push(`/app/activity/${transaction.reference}`)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
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
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {pageInfo && pageInfo.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {pageInfo.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={pageInfo.first}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(pageInfo.totalPages - 1, p + 1))}
                    disabled={pageInfo.last}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
