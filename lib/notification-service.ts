import { apiClient, type ApiResponse } from "./api-client"
import type { NotificationResponse, PageResponse } from "./types"

export interface SendNotificationRequest {
  userId: string
  type: string
  title: string
  message: string
  referenceId?: string
  channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH" | "ALL"
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
}

export interface BulkNotificationRequest {
  userIds: string[]
  type: string
  title: string
  message: string
  channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH" | "ALL"
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
}

export interface NotificationStatsResponse {
  totalNotifications: number
  unreadCount: number
  todayCount: number
  thisWeekCount: number
  countByType: Record<string, number>
  countByPriority: Record<string, number>
}

export class NotificationService {
  async getNotifications(page = 0, size = 20): Promise<ApiResponse<PageResponse<NotificationResponse>>> {
    return apiClient.get<PageResponse<NotificationResponse>>(`/notifications?page=${page}&size=${size}`)
  }

  async getNotification(notificationId: string): Promise<ApiResponse<NotificationResponse>> {
    return apiClient.get<NotificationResponse>(`/notifications/${notificationId}`)
  }

  async getUnreadNotifications(): Promise<ApiResponse<PageResponse<NotificationResponse>>> {
    return apiClient.get<PageResponse<NotificationResponse>>("/notifications/unread")
  }

  async getUnreadCount(): Promise<ApiResponse<number>> {
    return apiClient.get<number>("/notifications/unread-count")
  }

  async getStats(): Promise<ApiResponse<NotificationStatsResponse>> {
    return apiClient.get<NotificationStatsResponse>("/notifications/stats")
  }

  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/notifications/${notificationId}/read`)
  }

  async markAsUnread(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/notifications/${notificationId}/unread`)
  }

  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.put<void>("/notifications/read-all")
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/notifications/${notificationId}`)
  }

  async deleteAllNotifications(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>("/notifications/delete-all")
  }

  async sendNotification(data: SendNotificationRequest): Promise<ApiResponse<NotificationResponse>> {
    return apiClient.post<NotificationResponse>("/notifications/send", data)
  }

  async sendBulkNotification(data: BulkNotificationRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/notifications/send-bulk", data)
  }
}

export const notificationService = new NotificationService()
