"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { authService } from "@/lib/auth-service"
import { transactionService, type TransactionDetailResponse, type LedgerResponse } from "@/lib/transaction-service"
import type { UserResponse } from "@/lib/types"
import { Loader2, ArrowLeft, ArrowLeftRight, Download, Upload, Calendar, Hash, CreditCard } from "lucide-react"

export default function TransactionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reference = params.reference as string

  const [user, setUser] = useState<UserResponse | null>(null)
  const [transactionDetail, setTransactionDetail] = useState<TransactionDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [userResponse, detailResponse] = await Promise.all([
          authService.getCurrentUser(),
          transactionService.getTransactionDetail(reference),
        ])

        setUser(userResponse.data)
        setTransactionDetail(detailResponse.data)
      } catch (error) {
        console.error("Error fetching transaction detail:", error)
        router.push("/app/activity")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, reference])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader user={user || undefined} />
        <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  if (!transactionDetail) {
    return null
  }

  const { transaction, ledgerEntries } = transactionDetail
  const Icon = getTransactionIcon(transaction.type)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 space-y-6 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Activity
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{transaction.type}</h1>
              <p className="text-muted-foreground mt-1">Transaction Details</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>Reference</span>
                </div>
                <p className="font-mono text-sm">{transaction.reference}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </div>
                <p className="text-sm">{formatDate(transaction.createdAt)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(transaction.amount, transaction.currency)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={transaction.status} type="transaction" />
              </div>

              {transaction.fee && transaction.fee > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fee</p>
                  <p className="font-medium">{formatCurrency(transaction.fee, transaction.currency)}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{transaction.type}</p>
              </div>
            </div>

            {transaction.sourceWalletNumber && (
              <div className="space-y-1 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Source Wallet</span>
                </div>
                <p className="font-mono text-sm">{transaction.sourceWalletNumber}</p>
              </div>
            )}

            {transaction.destinationWalletNumber && (
              <div className="space-y-1 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Destination Wallet</span>
                </div>
                <p className="font-mono text-sm">{transaction.destinationWalletNumber}</p>
              </div>
            )}

            {transaction.description && (
              <div className="space-y-1 pt-2 border-t">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{transaction.description}</p>
              </div>
            )}

            {transaction.completedAt && (
              <div className="space-y-1 pt-2 border-t">
                <p className="text-sm text-muted-foreground">Completed At</p>
                <p className="text-sm">{formatDate(transaction.completedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {ledgerEntries && ledgerEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ledger Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Entry Type</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Balance Before</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Balance After</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries.map((entry: LedgerResponse) => (
                      <tr key={entry.id} className="border-b last:border-0">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-sm">{entry.entryType}</p>
                            {entry.description && <p className="text-xs text-muted-foreground">{entry.description}</p>}
                          </div>
                        </td>
                        <td className="text-right py-3 px-2 font-medium text-sm">
                          {formatCurrency(entry.amount, transaction.currency)}
                        </td>
                        <td className="text-right py-3 px-2 text-sm">
                          {formatCurrency(entry.balanceBefore, transaction.currency)}
                        </td>
                        <td className="text-right py-3 px-2 text-sm">
                          {formatCurrency(entry.balanceAfter, transaction.currency)}
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{formatDate(entry.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
