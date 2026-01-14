"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/status-badge"
import { authService } from "@/lib/auth-service"
import type { UserResponse } from "@/lib/types"
import { Loader2, User, Mail, Phone, Calendar, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser()
        setUser(response.data)
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phoneNumber: response.data.phoneNumber || "",
        })
      } catch (error) {
        console.error("[v0] Error fetching user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    try {
      const response = await authService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || undefined,
      })

      if (response.success) {
        setUser(response.data)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        toast({
          title: "Update Failed",
          description: response.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">
                    {user?.firstName[0]}
                    {user?.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <StatusBadge status={user?.status || "ACTIVE"} type="user" />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                {user?.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {formatDate(user?.createdAt || "")}</span>
                </div>
                {user?.lastLoginAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Last login {formatDate(user.lastLoginAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
              <CardDescription>Your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">KYC Verification</p>
                    <p className="text-sm text-muted-foreground">Identity verification status</p>
                  </div>
                </div>
                <StatusBadge status={user?.kycStatus || "NONE"} type="kyc" />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Extra security for your account</p>
                  </div>
                </div>
                {user?.mfaEnabled ? (
                  <StatusBadge status="ACTIVE" type="user" />
                ) : (
                  <StatusBadge status="NONE" type="kyc" />
                )}
              </div>

              <Button className="w-full mt-4" onClick={() => router.push("/app/security")}>
                Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <Button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full">
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  )
}
