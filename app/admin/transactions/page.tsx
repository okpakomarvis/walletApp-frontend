"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { adminService } from "@/lib/admin-service"
import type { TransactionResponse, PageResponse } from "@/lib/types"
import { Search, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminTransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [pageInfo, setPageInfo] = useState<PageResponse<TransactionResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  const [filters, setFilters] = useState({
    reference: "",
    userId: "",
    status: "ALL_STATUSES",
    type: "ALL_TYPES",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, filters])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await adminService.searchTransactions(currentPage, 20, filters)
      setTransactions(response.data.content)
      setPageInfo(response.data)
    } catch (error) {
      console.error("[v0] Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(0)
  }

  const clearFilters = () => {
    setFilters({
      reference: "",
      userId: "",
      status: "ALL_STATUSES",
      type: "ALL_TYPES",
      startDate: "",
      endDate: "",
    })
    setCurrentPage(0)
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction Monitoring</h1>
        <p className="text-muted-foreground mt-1">Search and monitor all platform transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reference</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Transaction reference"
                  value={filters.reference}
                  onChange={(e) => handleFilterChange("reference", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="Filter by user ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_STATUSES">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REVERSED">Reversed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_TYPES">All types</SelectItem>
                  <SelectItem value="DEPOSIT">Deposit</SelectItem>
                  <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="REVERSAL">Reversal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Reference</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">From</th>
                    <th className="pb-3 font-medium">To</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-4">
                        <p className="font-mono text-sm">{txn.reference}</p>
                      </td>
                      <td className="py-4">{txn.type}</td>
                      <td className="py-4 font-medium">{formatCurrency(txn.amount, txn.currency)}</td>
                      <td className="py-4">
                        <StatusBadge status={txn.status} type="transaction" />
                      </td>
                      <td className="py-4 text-sm">{txn.sourceWalletNumber || "-"}</td>
                      <td className="py-4 text-sm">{txn.destinationWalletNumber || "-"}</td>
                      <td className="py-4 text-sm">{formatDate(txn.createdAt)}</td>
                      <td className="py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/transactions/${txn.reference}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pageInfo && pageInfo.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {pageInfo.totalPages} ({pageInfo.totalElements} total)
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
        </CardContent>
      </Card>
    </div>
  )
}
