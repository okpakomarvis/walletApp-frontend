"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService, type ChangePasswordRequest } from "@/lib/auth-service"
import type { UserResponse } from "@/lib/types"
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ChangePasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordRequest, string>>>({})

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser()
        setUser(response.data)
      } catch (error) {
        console.error("Error fetching user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChangePasswordRequest, string>> = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters"
    } else if (formData.newPassword.length > 100) {
      newErrors.newPassword = "Password must be less than 100 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      await authService.changePassword(formData)
      setSuccess(true)
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully",
      })
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: keyof ChangePasswordRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader user={user || undefined} />

        <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 max-w-md">
          <Card className="border-primary">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Password Changed Successfully</h2>
                <p className="text-muted-foreground">
                  Your password has been updated. You can now use your new password to log in.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push("/app/security")}>Back to Security</Button>
                <Button variant="outline" onClick={() => router.push("/app/home")}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 max-w-md">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Change Password</h1>
              <p className="text-muted-foreground text-sm">Update your account password</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Password Requirements</CardTitle>
            <CardDescription>
              Your new password must be between 8-100 characters and different from your current password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => handleChange("currentPassword", e.target.value)}
                    placeholder="Enter current password"
                    className={errors.currentPassword ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                    placeholder="Enter new password (8-100 characters)"
                    className={errors.newPassword ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="Re-enter new password"
                    className={errors.confirmPassword ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  )
}
