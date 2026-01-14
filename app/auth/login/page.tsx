"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth-service"
import { Loader2, Wallet, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showMfa, setShowMfa] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mfaCode: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
        mfaCode: formData.mfaCode || undefined,
      })

      if (response.success) {
        // Check if user needs MFA
        if (response.data.user.mfaEnabled && !formData.mfaCode) {
          setShowMfa(true)
          setLoading(false)
          return
        }

        // Redirect based on user role
        const isAdmin = response.data.user.roles.includes("ADMIN")
        router.push(isAdmin ? "/admin/dashboard" : "/app/home")
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string }
      setError(apiError.message || "Login failed. Please check your credentials.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your virtual wallet account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!showMfa ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      maxLength={100}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="mfaCode">Verification Code</Label>
                <Input
                  id="mfaCode"
                  type="text"
                  placeholder="000000"
                  value={formData.mfaCode}
                  onChange={(e) => setFormData({ ...formData, mfaCode: e.target.value })}
                  required
                  maxLength={6}
                  pattern="\d{6}"
                />
                <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {showMfa ? "Verify & Sign In" : "Sign In"}
            </Button>
            {!showMfa && (
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline text-center">
                Forgot password?
              </Link>
            )}
            {showMfa && (
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowMfa(false)}>
                Back to login
              </Button>
            )}
            <p className="text-sm text-center text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
