"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/status-badge"
import { adminService } from "@/lib/admin-service"
import type { TransactionResponse } from "@/lib/types"
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface LedgerEntry {
  id: string
  walletNumber: string
  entryType: "DEBIT" | "CREDIT"
  amount: number
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}

interface TransactionDetailResponse {
  transaction: TransactionResponse
  ledgerEntries: LedgerEntry[]
}

export default function AdminTransactionDetailPage({ params }: { params: { reference: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<TransactionDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReverseDialog, setShowReverseDialog] = useState(false)
  const [reason, setReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchTransactionDetail()
  }, [params.reference])

  const fetchTransactionDetail = async () => {
    setLoading(true)
    try {
      const response = await adminService.getTransactionDetail(params.reference)
      setData(response.data)
    } catch (error) {
      console.error("[v0] Error fetching transaction detail:", error)
      toast({ title: "Error", description: "Failed to load transaction details", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleReverse = async () => {
    setProcessing(true)
    try {
      await adminService.reverseTransaction(params.reference, { reason })
      toast({ title: "Success", description: "Transaction reversed successfully" })
      setShowReverseDialog(false)
      setReason("")
      fetchTransactionDetail()
    } catch (error) {
      console.error("[v0] Error reversing transaction:", error)
      toast({ title: "Error", description: "Failed to reverse transaction", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Transaction not found</p>
      </div>
    )
  }

  const { transaction, ledgerEntries } = data
  const canReverse = transaction.status === "SUCCESS" && transaction.type !== "REVERSAL"

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/transactions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Transaction Details</h1>
            <p className="text-muted-foreground mt-1 font-mono">{transaction.reference}</p>
          </div>
        </div>
        {canReverse && (
          <Button variant="destructive" onClick={() => setShowReverseDialog(true)}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reverse Transaction
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Reference</p>
              <p className="font-mono">{transaction.reference}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{transaction.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(transaction.amount, transaction.currency)}</p>
            </div>
            {transaction.fee && (
              <div>
                <p className="text-sm text-muted-foreground">Fee</p>
                <p className="font-medium">{formatCurrency(transaction.fee, transaction.currency)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={transaction.status} type="transaction" />
            </div>
            {transaction.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{transaction.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transaction.sourceWalletNumber && (
              <div>
                <p className="text-sm text-muted-foreground">Source Wallet</p>
                <p className="font-mono">{transaction.sourceWalletNumber}</p>
              </div>
            )}
            {transaction.destinationWalletNumber && (
              <div>
                <p className="text-sm text-muted-foreground">Destination Wallet</p>
                <p className="font-mono">{transaction.destinationWalletNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">{formatDate(transaction.createdAt)}</p>
            </div>
            {transaction.completedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Completed At</p>
                <p className="font-medium">{formatDate(transaction.completedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {ledgerEntries && ledgerEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ledger Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Wallet</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Balance Before</th>
                    <th className="pb-3 font-medium">Balance After</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="py-4 font-mono text-sm">{entry.walletNumber}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            entry.entryType === "CREDIT"
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {entry.entryType}
                        </span>
                      </td>
                      <td className="py-4 font-medium">{formatCurrency(entry.amount, transaction.currency)}</td>
                      <td className="py-4">{formatCurrency(entry.balanceBefore, transaction.currency)}</td>
                      <td className="py-4 font-bold">{formatCurrency(entry.balanceAfter, transaction.currency)}</td>
                      <td className="py-4 text-sm">{formatDate(entry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showReverseDialog} onOpenChange={setShowReverseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This action will reverse the transaction and return funds to the source wallet. This cannot be undone.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Required)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for reversal"
                rows={4}
                maxLength={1000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReverseDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReverse} disabled={!reason || processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reversal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
