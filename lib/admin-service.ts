import { apiClient, type ApiResponse } from "./api-client"
import type {
  DashboardStatsResponse,
  PageResponse,
  UserResponse,
  KycResponse,
  TransactionResponse,
  WalletResponse,
} from "./types"

export interface AdminActionRequest {
  reason: string
  notes?: string
}

export interface KycReviewRequest {
  reason: string
}

export interface UpdateUserStatusRequest {
  status: "ACTIVE" | "SUSPENDED" | "LOCKED" | "DEACTIVATED"
  reason?: string
}

export interface AdminUserDetailResponse {
  user: UserResponse
  wallets: WalletResponse[]
  recentTransactions: TransactionResponse[]
  totalTransactionCount: number
  totalTransactionVolume: number
  transactionsLast30Days: number
}

export interface TransactionReport {
  startDate: string
  endDate: string
  totalCount: number
  totalVolume: number
  averageTransactionSize: number
  countByType: Record<string, number>
  countByStatus: Record<string, number>
  volumeByCurrency: Record<string, number>
  successRate: number
  generatedAt: string
}

export class AdminService {
  async getDashboardStats(): Promise<ApiResponse<DashboardStatsResponse>> {
    return apiClient.get<DashboardStatsResponse>("/admin/dashboard/stats")
  }

  async getUsers(page = 0, size = 20): Promise<ApiResponse<PageResponse<UserResponse>>> {
    return apiClient.get<PageResponse<UserResponse>>(`/admin/users?page=${page}&size=${size}`)
  }

  async getUser(userId: string): Promise<ApiResponse<UserResponse>> {
    return apiClient.get<UserResponse>(`/admin/users/${userId}`)
  }

  async updateUserStatus(userId: string, data: UpdateUserStatusRequest): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/admin/users/${userId}/status`, data)
  }

  async getPendingKyc(page = 0, size = 20): Promise<ApiResponse<PageResponse<KycResponse>>> {
    return apiClient.get<PageResponse<KycResponse>>(`/admin/kyc/pending?page=${page}&size=${size}`)
  }

  async approveKyc(kycId: string, data: KycReviewRequest): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/admin/kyc/${kycId}/approve`, data)
  }

  async rejectKyc(kycId: string, data: KycReviewRequest): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/admin/kyc/${kycId}/reject`, data)
  }

  async getAdminTransactions(page = 0, size = 20): Promise<ApiResponse<PageResponse<TransactionResponse>>> {
    return apiClient.get<PageResponse<TransactionResponse>>(`/admin/transactions?page=${page}&size=${size}`)
  }

  async getAdminWallets(page = 0, size = 20): Promise<ApiResponse<PageResponse<WalletResponse>>> {
    return apiClient.get<PageResponse<WalletResponse>>(`/admin/wallets?page=${page}&size=${size}`)
  }

  async searchUsers(query: string): Promise<ApiResponse<UserResponse[]>> {
    return apiClient.get<UserResponse[]>(`/admin/users/search?search=${encodeURIComponent(query)}`)
  }

  async getUserDetail(userId: string): Promise<ApiResponse<AdminUserDetailResponse>> {
    return apiClient.get<AdminUserDetailResponse>(`/admin/users/${userId}`)
  }

  async performUserAction(
    userId: string,
    action: "suspend" | "unsuspend" | "lock" | "unlock",
    data: AdminActionRequest,
  ): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/admin/users/${userId}/${action}`, data)
  }

  async searchTransactions(
    page = 0,
    size = 20,
    filters: {
      reference?: string
      userId?: string
      status?: string
      type?: string
      startDate?: string
      endDate?: string
    } = {},
  ): Promise<ApiResponse<PageResponse<TransactionResponse>>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (filters.reference) params.append("reference", filters.reference)
    if (filters.userId) params.append("userId", filters.userId)
    if (filters.status && filters.status !== "ALL_STATUSES") params.append("status", filters.status)
    if (filters.type && filters.type !== "ALL_TYPES") params.append("type", filters.type)
    if (filters.startDate) params.append("startDate", filters.startDate)
    if (filters.endDate) params.append("endDate", filters.endDate)

    return apiClient.get<PageResponse<TransactionResponse>>(`/admin/transactions?${params.toString()}`)
  }

  async getTransactionDetail(reference: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/admin/transactions/${reference}`)
  }

  async reverseTransaction(reference: string, data: AdminActionRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/admin/transactions/${reference}/reverse`, data)
  }

  async sendNotification(data: {
    userId: string
    type: string
    title: string
    message: string
    referenceId?: string
    channel: string
    priority: string
  }): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/notifications/send", data)
  }

  async sendBulkNotification(data: {
    userIds: string[]
    type: string
    title: string
    message: string
    channel: string
    priority: string
  }): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/notifications/send-bulk", data)
  }

  async getTransactionReport(startDate: string, endDate: string): Promise<ApiResponse<TransactionReport>> {
    return apiClient.get<TransactionReport>(`/admin/reports/transactions?startDate=${startDate}&endDate=${endDate}`)
  }
}

export const adminService = new AdminService()
