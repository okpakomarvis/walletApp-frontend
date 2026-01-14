"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/status-badge"
import { adminService } from "@/lib/admin-service"
import type { KycResponse, PageResponse } from "@/lib/types"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminKycPage() {
  const { toast } = useToast()
  const [kycList, setKycList] = useState<KycResponse[]>([])
  const [pageInfo, setPageInfo] = useState<PageResponse<KycResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedKyc, setSelectedKyc] = useState<KycResponse | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [reason, setReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchKyc()
  }, [currentPage])

  const fetchKyc = async () => {
    setLoading(true)
    try {
      const response = await adminService.getPendingKyc(currentPage, 20)
      setKycList(response.data.content)
      setPageInfo(response.data)
    } catch (error) {
      console.error("[v0] Error fetching KYC:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedKyc || !actionType) return

    setProcessing(true)
    try {
      if (actionType === "approve") {
        await adminService.approveKyc(selectedKyc.id, { reason })
        toast({ title: "KYC Approved", description: "User has been notified" })
      } else {
        await adminService.rejectKyc(selectedKyc.id, { reason })
        toast({ title: "KYC Rejected", description: "User has been notified" })
      }
      setSelectedKyc(null)
      setActionType(null)
      setReason("")
      fetchKyc()
    } catch (error) {
      console.error("[v0] Error processing KYC:", error)
      toast({ title: "Error", description: "Failed to process KYC", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KYC Review</h1>
        <p className="text-muted-foreground mt-1">Review and approve user verifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : kycList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending verifications</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Level</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Submitted</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kycList.map((kyc) => (
                    <tr key={kyc.id} className="border-b last:border-0">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{kyc.fullName}</p>
                          <p className="text-sm text-muted-foreground">{kyc.nationality}</p>
                        </div>
                      </td>
                      <td className="py-4">{kyc.level}</td>
                      <td className="py-4">
                        <StatusBadge status={kyc.status} type="kyc" />
                      </td>
                      <td className="py-4 text-sm">{formatDate(kyc.createdAt)}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedKyc(kyc)
                              setActionType("approve")
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedKyc(kyc)
                              setActionType("reject")
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedKyc && !!actionType}
        onOpenChange={() => {
          setSelectedKyc(null)
          setActionType(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve" : "Reject"} KYC Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Required)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "Verification approved - all documents verified"
                    : "Please provide reason for rejection"
                }
                rows={4}
                maxLength={1000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedKyc(null)
                setActionType(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={!reason || processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm {actionType === "approve" ? "Approval" : "Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
