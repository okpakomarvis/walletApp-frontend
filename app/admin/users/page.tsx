"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/status-badge"
import { adminService } from "@/lib/admin-service"
import type { UserResponse, PageResponse } from "@/lib/types"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserResponse[]>([])
  const [pageInfo, setPageInfo] = useState<PageResponse<UserResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        if (searchTerm) {
          const response = await adminService.searchUsers(searchTerm)
          setUsers(response.data)
          setPageInfo(null)
        } else {
          const response = await adminService.getUsers(currentPage, 20)
          setUsers(response.data.content)
          setPageInfo(response.data)
        }
      } catch (error) {
        console.error("[v0] Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(() => {
      fetchUsers()
    }, 300)

    return () => clearTimeout(debounce)
  }, [currentPage, searchTerm])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage platform users</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">KYC</th>
                    <th className="pb-3 font-medium">Joined</th>
                    <th className="pb-3 font-medium">Last Login</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <StatusBadge status={user.status} type="user" />
                      </td>
                      <td className="py-4">
                        <StatusBadge status={user.kycStatus} type="kyc" />
                      </td>
                      <td className="py-4 text-sm">{formatDate(user.createdAt)}</td>
                      <td className="py-4 text-sm">{formatDate(user.lastLoginAt)}</td>
                      <td className="py-4">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/users/${user.id}`)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pageInfo && pageInfo.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {pageInfo.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={pageInfo.first}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(pageInfo.totalPages - 1, p + 1))}
                  disabled={pageInfo.last}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
