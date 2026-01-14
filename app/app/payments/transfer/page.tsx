"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PinInput } from "@/components/pin-input"
import { authService } from "@/lib/auth-service"
import { walletService } from "@/lib/wallet-service"
import { transactionService } from "@/lib/transaction-service"
import type { UserResponse, WalletResponse, TransactionResponse } from "@/lib/types"
import { ArrowLeftRight, Loader2, CheckCircle, AlertCircle } from "lucide-react"

type TransferStep = "form" | "review" | "pin" | "result"

export default function TransferPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [wallets, setWallets] = useState<WalletResponse[]>([])
  const [step, setStep] = useState<TransferStep>("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<TransactionResponse | null>(null)

  const [formData, setFormData] = useState({
    sourceWalletId: "",
    destinationWalletNumber: "",
    amount: "",
    description: "",
    pin: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, walletsResponse] = await Promise.all([
          authService.getCurrentUser(),
          walletService.getWallets(),
        ])
        setUser(userResponse.data)
        setWallets(walletsResponse.data.filter((w) => w.status === "ACTIVE"))
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        router.push("/auth/login")
      }
    }
    fetchData()
  }, [router])

  const selectedWallet = wallets.find((w) => w.id === formData.sourceWalletId)

  const handleSubmit = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await transactionService.transfer({
        sourceWalletId: formData.sourceWalletId,
        destinationWalletNumber: formData.destinationWalletNumber,
        amount: Number.parseFloat(formData.amount),
        description: formData.description || undefined,
        pin: formData.pin,
      })

      if (response.success) {
        setResult(response.data)
        setStep("result")
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string }
      setError(apiError.message || "Transfer failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const renderForm = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Transfer Money</CardTitle>
            <CardDescription>Send money to another wallet</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="sourceWallet">From Wallet</Label>
          <Select
            value={formData.sourceWalletId}
            onValueChange={(value) => setFormData({ ...formData, sourceWalletId: value })}
          >
            <SelectTrigger id="sourceWallet">
              <SelectValue placeholder="Select wallet" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.currency} - {formatCurrency(wallet.availableBalance, wallet.currency)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="destinationWallet">To Wallet Number</Label>
          <Input
            id="destinationWallet"
            placeholder="Enter wallet number"
            value={formData.destinationWalletNumber}
            onChange={(e) => setFormData({ ...formData, destinationWalletNumber: e.target.value })}
            minLength={10}
            maxLength={20}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            max="1000000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          {selectedWallet && (
            <p className="text-sm text-muted-foreground">
              Available: {formatCurrency(selectedWallet.availableBalance, selectedWallet.currency)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="What's this transfer for?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            maxLength={500}
          />
        </div>

        <Button
          className="w-full"
          onClick={() => setStep("review")}
          disabled={
            !formData.sourceWalletId ||
            !formData.destinationWalletNumber ||
            !formData.amount ||
            Number.parseFloat(formData.amount) <= 0
          }
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  )

  const renderReview = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Review Transfer</CardTitle>
        <CardDescription>Please confirm the details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b">
            <span className="text-muted-foreground">From</span>
            <span className="font-medium">
              {selectedWallet?.currency} Wallet - {selectedWallet?.walletNumber.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b">
            <span className="text-muted-foreground">To</span>
            <span className="font-medium font-mono">{formData.destinationWalletNumber}</span>
          </div>
          <div className="flex justify-between py-3 border-b">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-lg">
              {formatCurrency(Number.parseFloat(formData.amount), selectedWallet?.currency || "USD")}
            </span>
          </div>
          {formData.description && (
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Description</span>
              <span className="text-right max-w-xs">{formData.description}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("form")}>
            Back
          </Button>
          <Button className="flex-1" onClick={() => setStep("pin")}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderPin = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Enter PIN</CardTitle>
        <CardDescription className="text-center">Enter your 4-digit transaction PIN</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <PinInput value={formData.pin} onChange={(pin) => setFormData({ ...formData, pin })} />

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => setStep("review")}
            disabled={loading}
          >
            Back
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={formData.pin.length !== 4 || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Transfer
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderResult = () => (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-12 pb-8">
        <div className="text-center space-y-4">
          <div
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              result?.status === "SUCCESS" ? "bg-success/10" : "bg-warning/10"
            }`}
          >
            <CheckCircle className={`h-8 w-8 ${result?.status === "SUCCESS" ? "text-success" : "text-warning"}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {result?.status === "SUCCESS" ? "Transfer Successful" : "Transfer Pending"}
            </h2>
            <p className="text-muted-foreground">
              {result?.status === "SUCCESS" ? "Your money has been transferred" : "Your transfer is being processed"}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono font-medium">{result?.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-lg">
                {formatCurrency(result?.amount || 0, result?.currency || "USD")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{new Date(result?.createdAt || "").toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/app/activity")}>
              View Activity
            </Button>
            <Button className="flex-1" onClick={() => router.push("/app/home")}>
              Back to Home
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6">
        {step === "form" && renderForm()}
        {step === "review" && renderReview()}
        {step === "pin" && renderPin()}
        {step === "result" && renderResult()}
      </main>

      <MobileNav />
    </div>
  )
}
