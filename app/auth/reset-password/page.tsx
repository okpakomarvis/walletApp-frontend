"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth-service"
import { CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token")
    }
  }, [token])

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
    return Object.values(requirements).every(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Invalid reset token")
      return
    }

    if (!validatePassword(newPassword)) {
      setError("Password does not meet requirements")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.resetPassword({
        token,
        newPassword,
        confirmPassword,
      })

      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } else {
        setError(response.error || "Failed to reset password. The link may have expired.")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Invalid Link</CardTitle>
            <CardDescription>This password reset link is invalid or has expired</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/auth/forgot-password")}>
              Request New Link
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
            <CardDescription>Your password has been successfully reset</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Redirecting to login page...</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/auth/login")}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const passwordRequirements = [
    { text: "At least 8 characters", met: newPassword.length >= 8 },
    { text: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { text: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { text: "One number", met: /[0-9]/.test(newPassword) },
    { text: "One special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {newPassword && (
                <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Password must contain:</p>
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${req.met ? "bg-primary" : "bg-muted-foreground/40"}`}
                      />
                      <span className={req.met ? "text-primary" : "text-muted-foreground"}>{req.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 mt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
            <Link href="/auth/login" className="w-full">
              <Button type="button" variant="outline" className="w-full bg-transparent" disabled={isLoading}>
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
