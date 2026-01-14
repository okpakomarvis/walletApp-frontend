"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth-service"
import { walletService } from "@/lib/wallet-service"
import { transactionService } from "@/lib/transaction-service"
import type { UserResponse, WalletResponse, TransactionResponse } from "@/lib/types"
import { ArrowDownToLine, Loader2, CheckCircle, AlertCircle, CreditCard } from "lucide-react"

type DepositStep = "form" | "payment" | "processing" | "result"

export default function DepositPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [wallets, setWallets] = useState<WalletResponse[]>([])
  const [step, setStep] = useState<DepositStep>("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<TransactionResponse | null>(null)

  const [formData, setFormData] = useState({
    walletId: "",
    amount: "",
    gateway: "",
    paymentReference: "",
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

  const selectedWallet = wallets.find((w) => w.id === formData.walletId)

  const handleInitiatePayment = async () => {
    setError("")
    setLoading(true)

    try {
      // Simulate payment gateway initialization
      // In production, this would integrate with Paystack, Flutterwave, etc.
      const mockPaymentRef = `PAY-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

      setFormData({ ...formData, paymentReference: mockPaymentRef })
      setStep("payment")
    } catch (err: unknown) {
      const apiError = err as { message?: string }
      setError(apiError.message || "Failed to initialize payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteDeposit = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await transactionService.deposit({
        walletId: formData.walletId,
        amount: Number.parseFloat(formData.amount),
        paymentMethod: formData.gateway,
        paymentReference: formData.paymentReference,
        gateway: formData.gateway,
      })

      if (response.success) {
        setResult(response.data)
        setStep("result")
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string }
      setError(apiError.message || "Deposit failed. Please try again.")
      setStep("form")
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
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
            <ArrowDownToLine className="h-6 w-6 text-success" />
          </div>
          <div>
            <CardTitle>Deposit Funds</CardTitle>
            <CardDescription>Add money to your wallet using external payment gateway</CardDescription>
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
          <Label htmlFor="wallet">To Wallet</Label>
          <Select value={formData.walletId} onValueChange={(value) => setFormData({ ...formData, walletId: value })}>
            <SelectTrigger id="wallet">
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
          {selectedWallet && <p className="text-sm text-muted-foreground">Wallet: {selectedWallet.walletNumber}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <p className="text-sm text-muted-foreground">
            Minimum deposit: {formatCurrency(0.01, selectedWallet?.currency || "USD")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gateway">Payment Gateway</Label>
          <Select value={formData.gateway} onValueChange={(value) => setFormData({ ...formData, gateway: value })}>
            <SelectTrigger id="gateway">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PAYSTACK">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Paystack
                </div>
              </SelectItem>
              <SelectItem value="FLUTTERWAVE">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Flutterwave
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Choose your preferred payment gateway for this transaction</p>
        </div>

        <div className="pt-4 space-y-3">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Supported Payment Methods</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Debit/Credit Cards (Visa, Mastercard)</li>
              <li>• Bank Transfer</li>
              <li>• Mobile Money</li>
              <li>• USSD</li>
            </ul>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleInitiatePayment}
          disabled={
            !formData.walletId ||
            !formData.amount ||
            !formData.gateway ||
            Number.parseFloat(formData.amount) <= 0 ||
            loading
          }
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue to Payment
        </Button>
      </CardContent>
    </Card>
  )

  const renderPayment = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Complete Payment</CardTitle>
        <CardDescription className="text-center">
          You will be redirected to {formData.gateway} to complete your payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-2xl font-bold">
              {formatCurrency(Number.parseFloat(formData.amount), selectedWallet?.currency || "USD")}
            </p>
            <p className="text-sm text-muted-foreground">Amount to deposit</p>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Wallet</span>
              <span className="font-medium">{selectedWallet?.currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gateway</span>
              <span className="font-medium">{formData.gateway}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs">{formData.paymentReference}</span>
            </div>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            In the next version release, you would be redirected to the payment gateway to complete your transaction.
            Click "Complete Payment" to simulate a successful payment.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => setStep("form")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleCompleteDeposit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Payment
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
              {result?.status === "SUCCESS" ? "Deposit Successful" : "Deposit Pending"}
            </h2>
            <p className="text-muted-foreground">
              {result?.status === "SUCCESS"
                ? "Your funds have been added to your wallet"
                : "Your deposit is being processed"}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono font-medium">{result?.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-lg text-success">
                +{formatCurrency(result?.amount || 0, result?.currency || "USD")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span>{formData.gateway}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{new Date(result?.createdAt || "").toLocaleString()}</span>
            </div>
          </div>

          {result?.status === "SUCCESS" && (
            <Alert className="bg-success/10 border-success/20">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Your new balance will be reflected immediately in your wallet.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/app/wallets")}>
              View Wallets
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
        {step === "payment" && renderPayment()}
        {step === "result" && renderResult()}
      </main>

      <MobileNav />
    </div>
  )
}
