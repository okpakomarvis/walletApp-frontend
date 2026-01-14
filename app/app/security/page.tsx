"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth-service"
import type { UserResponse } from "@/lib/types"
import { Shield, Lock, Key, LogOut, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SecurityPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser()
        setUser(response.data)
      } catch (error) {
        console.error("[v0] Error fetching user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleToggleMfa = async () => {
    try {
      if (user?.mfaEnabled) {
        await authService.disableMfa()
        toast({ title: "MFA Disabled", description: "Two-factor authentication has been turned off" })
      } else {
        await authService.enableMfa()
        toast({
          title: "MFA Enabled",
          description: "Two-factor authentication is now active",
        })
      }
      const response = await authService.getCurrentUser()
      setUser(response.data)
    } catch (error) {
      console.error("[v0] Error toggling MFA:", error)
      toast({ title: "Error", description: "Failed to update MFA settings", variant: "destructive" })
    }
  }

  const handleLogoutAll = async () => {
    try {
      await authService.logout()
      toast({ title: "Logged out", description: "You've been logged out from all devices" })
      router.push("/auth/login")
    } catch (error) {
      console.error("[v0] Error logging out:", error)
    }
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
          <h1 className="text-3xl font-bold">Security Center</h1>
          <p className="text-muted-foreground mt-1">Manage your security settings</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.mfaEnabled ? "Enabled" : "Disabled"}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.mfaEnabled ? "Your account is protected with 2FA" : "Enable for better security"}
                </p>
              </div>
              <Button variant={user?.mfaEnabled ? "outline" : "default"} onClick={handleToggleMfa}>
                {user?.mfaEnabled ? "Disable MFA" : "Enable MFA"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => router.push("/app/security/change-password")}>
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Transaction PIN</CardTitle>
                  <CardDescription>Required for transfers and withdrawals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => router.push("/app/security/set-pin")}>
                Set/Change PIN
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <LogOut className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <CardTitle>Session Management</CardTitle>
                  <CardDescription>Log out from all devices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleLogoutAll}>
                Logout All Devices
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
