"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PinInput } from "@/components/pin-input"
import { authService } from "@/lib/auth-service"
import { Loader2, CheckCircle, AlertCircle, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { UserResponse } from "@/lib/types"

type PinStep = "form" | "result"

export default function SetPinPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<PinStep>("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<UserResponse | null>(null)

  const [formData, setFormData] = useState({
    pin: "",
    confirmPin: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser()
        setUser(response.data)
      } catch (error) {
        console.error("Error fetching user:", error)
        router.push("/auth/login")
      }
    }

    fetchUser()
  }, [router])

  const handleSubmit = async () => {
    setError("")

    if (formData.pin.length !== 4) {
      setError("PIN must be 4 digits")
      return
    }

    if (formData.pin !== formData.confirmPin) {
      setError("PINs do not match")
      return
    }

    if (!/^\d{4}$/.test(formData.pin)) {
      setError("PIN must contain only numbers")
      return
    }

    setLoading(true)

    try {
      const response = await authService.setPin({
        pin: formData.pin,
        confirmPin: formData.confirmPin,
      })

      if (response.success) {
        setSuccess(true)
        setStep("result")
        toast({
          title: "PIN Set Successfully",
          description: "Your transaction PIN has been updated",
        })
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string }
      setError(apiError.message || "Failed to set PIN. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderForm = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Set Transaction PIN</CardTitle>
            <CardDescription>Create a 4-digit PIN for secure transactions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Enter New PIN</label>
          <PinInput value={formData.pin} onChange={(pin) => setFormData({ ...formData, pin })} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm PIN</label>
          <PinInput value={formData.confirmPin} onChange={(confirmPin) => setFormData({ ...formData, confirmPin })} />
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">PIN Requirements:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Must be exactly 4 digits</li>
            <li>Only numbers are allowed</li>
            <li>Avoid using obvious patterns (e.g., 1234, 0000)</li>
            <li>Keep your PIN secure and confidential</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/app/security")}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={formData.pin.length !== 4 || formData.confirmPin.length !== 4 || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Set PIN
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderResult = () => (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-12 pb-8">
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-success/10`}>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">PIN Set Successfully</h2>
            <p className="text-muted-foreground">Your transaction PIN has been updated and is now active</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">PIN is Active</p>
                <p className="text-sm text-muted-foreground">
                  You'll need this PIN to authorize transfers and withdrawals
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/app/security")}>
              Back to Security
            </Button>
            <Button className="flex-1" onClick={() => router.push("/app/home")}>
              Go to Home
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
        {step === "result" && renderResult()}
      </main>

      <MobileNav />
    </div>
  )
}
