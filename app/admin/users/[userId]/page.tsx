"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/status-badge"
import { adminService } from "@/lib/admin-service"
import type { UserResponse, WalletResponse, TransactionResponse } from "@/lib/types"
import { ArrowLeft, Loader2, Ban, Unlock, Lock, Check } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface AdminUserDetailResponse {
  user: UserResponse
  wallets: WalletResponse[]
  recentTransactions: TransactionResponse[]
  totalTransactionCount: number
  totalTransactionVolume: number
  transactionsLast30Days: number
}

export default function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<AdminUserDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionType, setActionType] = useState<"suspend" | "unsuspend" | "lock" | "unlock" | null>(null)
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchUserDetails()
  }, [params.userId])

  const fetchUserDetails = async () => {
    setLoading(true)
    try {
      const response = await adminService.getUserDetail(params.userId)
      setData(response.data)
    } catch (error) {
      console.error("[v0] Error fetching user details:", error)
      toast({ title: "Error", description: "Failed to load user details", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!actionType) return

    setProcessing(true)
    try {
      await adminService.performUserAction(params.userId, actionType, { reason, notes })
      toast({
        title: "Success",
        description: `User ${actionType === "suspend" ? "suspended" : actionType === "unsuspend" ? "unsuspended" : actionType === "lock" ? "locked" : "unlocked"} successfully`,
      })
      setActionType(null)
      setReason("")
      setNotes("")
      fetchUserDetails()
    } catch (error) {
      console.error("[v0] Error performing action:", error)
      toast({ title: "Error", description: "Failed to perform action", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never"
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
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">User not found</p>
      </div>
    )
  }

  const { user, wallets, recentTransactions, totalTransactionCount, totalTransactionVolume, transactionsLast30Days } =
    data

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {user.status === "ACTIVE" && (
            <>
              <Button variant="outline" onClick={() => setActionType("suspend")}>
                <Ban className="h-4 w-4 mr-2" />
                Suspend
              </Button>
              <Button variant="outline" onClick={() => setActionType("lock")}>
                <Lock className="h-4 w-4 mr-2" />
                Lock
              </Button>
            </>
          )}
          {user.status === "SUSPENDED" && (
            <Button variant="outline" onClick={() => setActionType("unsuspend")}>
              <Check className="h-4 w-4 mr-2" />
              Unsuspend
            </Button>
          )}
          {user.status === "LOCKED" && (
            <Button variant="outline" onClick={() => setActionType("unlock")}>
              <Unlock className="h-4 w-4 mr-2" />
              Unlock
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={user.status} type="user" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={user.kycStatus} type="kyc" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MFA Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user.mfaEnabled ? "Yes" : "No"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallets">Wallets ({wallets.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{user.phoneNumber || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roles</p>
                  <p className="font-medium">{user.roles.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">{formatDate(user.lastLoginAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalTransactionCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{transactionsLast30Days} in last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₦{(totalTransactionVolume / 1000).toFixed(1)}K</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{wallets.filter((w) => w.status === "ACTIVE").length}</p>
                <p className="text-xs text-muted-foreground mt-1">of {wallets.length} total</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallets">
          <Card>
            <CardHeader>
              <CardTitle>Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              {wallets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No wallets found</p>
              ) : (
                <div className="space-y-4">
                  {wallets.map((wallet) => (
                    <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{wallet.walletNumber}</p>
                        <p className="text-sm text-muted-foreground">{wallet.currency}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(wallet.balance, wallet.currency)}</p>
                        <StatusBadge status={wallet.status} type="wallet" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No transactions found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Reference</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((txn) => (
                        <tr key={txn.id} className="border-b last:border-0">
                          <td className="py-4">
                            <p className="font-mono text-sm">{txn.reference}</p>
                          </td>
                          <td className="py-4">{txn.type}</td>
                          <td className="py-4 font-medium">{formatCurrency(txn.amount, txn.currency)}</td>
                          <td className="py-4">
                            <StatusBadge status={txn.status} type="transaction" />
                          </td>
                          <td className="py-4 text-sm">{formatDate(txn.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "suspend"
                ? "Suspend User"
                : actionType === "unsuspend"
                  ? "Unsuspend User"
                  : actionType === "lock"
                    ? "Lock Account"
                    : "Unlock Account"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Required)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for this action"
                rows={3}
                maxLength={1000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={!reason || processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
