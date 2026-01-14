"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { adminService } from "@/lib/admin-service"
import { Loader2, Send, Users, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const NOTIFICATION_TYPES = [
  "TRANSACTION_SUCCESS",
  "DEPOSIT_FAILED",
  "KYC_APPROVED",
  "KYC_REJECTED",
  "WALLET_FROZEN",
  "SYSTEM_MAINTENANCE",
  "PROMOTIONAL",
  "ANNOUNCEMENT",
]

const CHANNELS = [
  { value: "IN_APP", label: "In-App" },
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "PUSH", label: "Push" },
  { value: "ALL", label: "All Channels" },
]

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
]

export default function AdminNotificationsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("single")

  // Single notification state
  const [singleForm, setSingleForm] = useState({
    userId: "",
    type: "ANNOUNCEMENT",
    title: "",
    message: "",
    referenceId: "",
    channel: "IN_APP",
    priority: "MEDIUM",
  })
  const [sendingSingle, setSendingSingle] = useState(false)
  const [showUserPicker, setShowUserPicker] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  // Bulk notification state
  const [bulkForm, setBulkForm] = useState({
    userIds: [] as string[],
    type: "ANNOUNCEMENT",
    title: "",
    message: "",
    channel: "IN_APP",
    priority: "MEDIUM",
  })
  const [sendingBulk, setSendingBulk] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])

  const handleSearchUsers = async () => {
    if (!userSearch) return
    setSearching(true)
    try {
      const response = await adminService.searchUsers(userSearch)
      setSearchResults(response.data)
    } catch (error) {
      console.error("[v0] Error searching users:", error)
      toast({ title: "Error", description: "Failed to search users", variant: "destructive" })
    } finally {
      setSearching(false)
    }
  }

  const handleSelectUser = (user: any) => {
    if (activeTab === "single") {
      setSingleForm((prev) => ({ ...prev, userId: user.id }))
      setShowUserPicker(false)
      setUserSearch("")
      toast({ title: "User Selected", description: `${user.firstName} ${user.lastName} (${user.email})` })
    } else {
      if (!selectedUsers.find((u) => u.id === user.id)) {
        setSelectedUsers((prev) => [...prev, user])
        setBulkForm((prev) => ({ ...prev, userIds: [...prev.userIds, user.id] }))
      }
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
    setBulkForm((prev) => ({ ...prev, userIds: prev.userIds.filter((id) => id !== userId) }))
  }

  const handleSendSingle = async () => {
    if (!singleForm.userId || !singleForm.title || !singleForm.message) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    setSendingSingle(true)
    try {
      await adminService.sendNotification(singleForm)
      toast({ title: "Success", description: "Notification sent successfully" })
      setSingleForm({
        userId: "",
        type: "ANNOUNCEMENT",
        title: "",
        message: "",
        referenceId: "",
        channel: "IN_APP",
        priority: "MEDIUM",
      })
    } catch (error) {
      console.error("[v0] Error sending notification:", error)
      toast({ title: "Error", description: "Failed to send notification", variant: "destructive" })
    } finally {
      setSendingSingle(false)
    }
  }

  const handleSendBulk = async () => {
    if (bulkForm.userIds.length === 0 || !bulkForm.title || !bulkForm.message) {
      toast({
        title: "Error",
        description: "Please select users and fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSendingBulk(true)
    try {
      await adminService.sendBulkNotification(bulkForm)
      toast({ title: "Success", description: `Notification sent to ${bulkForm.userIds.length} users` })
      setBulkForm({
        userIds: [],
        type: "ANNOUNCEMENT",
        title: "",
        message: "",
        channel: "IN_APP",
        priority: "MEDIUM",
      })
      setSelectedUsers([])
    } catch (error) {
      console.error("[v0] Error sending bulk notification:", error)
      toast({ title: "Error", description: "Failed to send bulk notification", variant: "destructive" })
    } finally {
      setSendingBulk(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Management</h1>
        <p className="text-muted-foreground mt-1">Send notifications to users</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="single">
            <User className="h-4 w-4 mr-2" />
            Single User
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Users className="h-4 w-4 mr-2" />
            Bulk Send
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification to User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>User (Required)</Label>
                <Dialog open={showUserPicker} onOpenChange={setShowUserPicker}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      {singleForm.userId ? "User Selected" : "Select User"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Search and Select User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search by email or name..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSearchUsers()}
                        />
                        <Button onClick={handleSearchUsers} disabled={searching}>
                          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 border rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => handleSelectUser(user)}
                          >
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                <Label htmlFor="single-type">Type (Required)</Label>
                <Select
                  value={singleForm.type}
                  onValueChange={(value) => setSingleForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="single-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="single-title">Title (Required)</Label>
                <Input
                  id="single-title"
                  value={singleForm.title}
                  onChange={(e) => setSingleForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="single-message">Message (Required)</Label>
                <Textarea
                  id="single-message"
                  value={singleForm.message}
                  onChange={(e) => setSingleForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  rows={4}
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="single-reference">Reference ID (Optional)</Label>
                <Input
                  id="single-reference"
                  value={singleForm.referenceId}
                  onChange={(e) => setSingleForm((prev) => ({ ...prev, referenceId: e.target.value }))}
                  placeholder="Transaction or resource ID"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="single-channel">Channel</Label>
                  <Select
                    value={singleForm.channel}
                    onValueChange={(value) => setSingleForm((prev) => ({ ...prev, channel: value }))}
                  >
                    <SelectTrigger id="single-channel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNELS.map((channel) => (
                        <SelectItem key={channel.value} value={channel.value}>
                          {channel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="single-priority">Priority</Label>
                  <Select
                    value={singleForm.priority}
                    onValueChange={(value) => setSingleForm((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger id="single-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSendSingle} disabled={sendingSingle} className="w-full">
                {sendingSingle ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Notification
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Bulk Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Users (Required)</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      {selectedUsers.length > 0 ? `${selectedUsers.length} users selected` : "Add Users"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Search and Add Users</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search by email or name..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSearchUsers()}
                        />
                        <Button onClick={handleSearchUsers} disabled={searching}>
                          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 border rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => handleSelectUser(user)}
                          >
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 border rounded-lg">
                    {selectedUsers.map((user) => (
                      <Badge key={user.id} variant="secondary" className="gap-2">
                        {user.firstName} {user.lastName}
                        <button onClick={() => handleRemoveUser(user.id)} className="hover:text-destructive">
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-type">Type (Required)</Label>
                <Select
                  value={bulkForm.type}
                  onValueChange={(value) => setBulkForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="bulk-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-title">Title (Required)</Label>
                <Input
                  id="bulk-title"
                  value={bulkForm.title}
                  onChange={(e) => setBulkForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-message">Message (Required)</Label>
                <Textarea
                  id="bulk-message"
                  value={bulkForm.message}
                  onChange={(e) => setBulkForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  rows={4}
                  maxLength={1000}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bulk-channel">Channel</Label>
                  <Select
                    value={bulkForm.channel}
                    onValueChange={(value) => setBulkForm((prev) => ({ ...prev, channel: value }))}
                  >
                    <SelectTrigger id="bulk-channel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNELS.map((channel) => (
                        <SelectItem key={channel.value} value={channel.value}>
                          {channel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-priority">Priority</Label>
                  <Select
                    value={bulkForm.priority}
                    onValueChange={(value) => setBulkForm((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger id="bulk-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSendBulk} disabled={sendingBulk} className="w-full">
                {sendingBulk ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to {selectedUsers.length} User{selectedUsers.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
