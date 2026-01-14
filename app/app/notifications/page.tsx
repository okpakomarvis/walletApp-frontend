"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth-service"
import { notificationService } from "@/lib/notification-service"
import type { UserResponse, NotificationResponse } from "@/lib/types"
import { Bell, Trash2, Check, Loader2, CheckCheck, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const userResponse = await authService.getCurrentUser()
      setUser(userResponse.data)

      try {
        const notificationsResponse = await (activeTab === "unread"
          ? notificationService.getUnreadNotifications()
          : notificationService.getNotifications(0, 50))

        setNotifications(notificationsResponse.data.content)
      } catch (notifError: any) {
        console.error("[v0] Error fetching notifications:", notifError)
        setError(notifError.message || "Failed to load notifications. Please try again.")
        setNotifications([])
      }
    } catch (error: any) {
      console.error("[v0] Error fetching user data:", error)
      if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        router.push("/auth/login")
      } else {
        setError("Failed to load page. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
      toast({ title: "Marked as read" })
    } catch (error) {
      console.error("[v0] Error marking as read:", error)
      toast({ title: "Failed to mark as read", variant: "destructive" })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
      toast({ title: "All marked as read" })
    } catch (error) {
      console.error("[v0] Error marking all as read:", error)
      toast({ title: "Failed to mark all as read", variant: "destructive" })
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(notifications.filter((n) => n.id !== notificationId))
      toast({ title: "Notification deleted" })
    } catch (error) {
      console.error("[v0] Error deleting notification:", error)
      toast({ title: "Failed to delete notification", variant: "destructive" })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getTypeIcon = (type: string) => {
    return "🔔"
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated with your account activity</p>
          </div>
          {filteredNotifications.some((n) => !n.isRead) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchData}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({notifications.filter((n) => !n.isRead).length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      {error ? "Unable to load notifications" : "No notifications"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors ${!notification.isRead ? "bg-primary/5" : ""}`}
                      >
                        <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{notification.title}</h3>
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <StatusBadge status={notification.priority} type="notification" />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="mr-1 h-3 w-3" />
                                Mark read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  )
}
