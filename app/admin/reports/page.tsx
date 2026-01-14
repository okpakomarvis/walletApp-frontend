"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminService } from "@/lib/admin-service"
import { Calendar, Download, Loader2, TrendingUp, ArrowUpDown, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TransactionReport {
  startDate: string
  endDate: string
  totalCount: number
  totalVolume: number
  averageTransactionSize: number
  countByType: Record<string, number>
  countByStatus: Record<string, number>
  volumeByCurrency: Record<string, number>
  successRate: number
  generatedAt: string
}

export default function AdminReportsPage() {
  const { toast } = useToast()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<TransactionReport | null>(null)

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({ title: "Error", description: "Please select both start and end dates", variant: "destructive" })
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({ title: "Error", description: "Start date must be before end date", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await adminService.getTransactionReport(startDate, endDate)
      setReport(response.data)
      toast({ title: "Success", description: "Report generated successfully" })
    } catch (error) {
      console.error("[v0] Error generating report:", error)
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!report) return

    const csvContent = generateCSV(report)
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transaction-report-${report.startDate}-${report.endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateCSV = (data: TransactionReport) => {
    const rows = [
      ["Transaction Report"],
      ["Period", `${data.startDate} to ${data.endDate}`],
      ["Generated", new Date(data.generatedAt).toLocaleString()],
      [],
      ["Summary"],
      ["Total Transactions", data.totalCount],
      ["Total Volume", `₦${data.totalVolume.toLocaleString()}`],
      ["Average Transaction Size", `₦${data.averageTransactionSize.toLocaleString()}`],
      ["Success Rate", `${data.successRate}%`],
      [],
      ["By Type"],
      ...Object.entries(data.countByType).map(([type, count]) => [type, count]),
      [],
      ["By Status"],
      ...Object.entries(data.countByStatus).map(([status, count]) => [status, count]),
      [],
      ["Volume by Currency"],
      ...Object.entries(data.volumeByCurrency).map(([currency, volume]) => [currency, `₦${volume.toLocaleString()}`]),
    ]

    return rows.map((row) => row.join(",")).join("\n")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Generate and export transaction reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (Required)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Required)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Report Period: {formatDate(report.startDate)} - {formatDate(report.endDate)}
              </p>
              <p className="text-xs text-muted-foreground">
                Generated: {new Date(report.generatedAt).toLocaleString()}
              </p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalCount.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(report.totalVolume)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Size</CardTitle>
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(report.averageTransactionSize)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.successRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Transactions by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(report.countByType).map(([type, count]) => {
                    const percentage = (count / report.totalCount) * 100
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{type}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
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

            <Card>
              <CardHeader>
                <CardTitle>Transactions by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(report.countByStatus).map(([status, count]) => {
                    const percentage = (count / report.totalCount) * 100
                    const color =
                      status === "SUCCESS"
                        ? "bg-success"
                        : status === "FAILED"
                          ? "bg-destructive"
                          : status === "PENDING"
                            ? "bg-warning"
                            : "bg-muted-foreground"
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{status}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color} rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {Object.keys(report.volumeByCurrency).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Volume by Currency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(report.volumeByCurrency).map(([currency, volume]) => {
                    const percentage = (volume / report.totalVolume) * 100
                    return (
                      <div key={currency}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{currency}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(volume)} ({percentage.toFixed(1)}%)
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
        </>
      )}
    </div>
  )
}
