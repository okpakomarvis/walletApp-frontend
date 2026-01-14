// Core types based on API specification

export interface UserResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  status: "ACTIVE" | "SUSPENDED" | "LOCKED"
  kycStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED"
  mfaEnabled: boolean
  roles: string[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: UserResponse
}

export interface WalletResponse {
  id: string
  userId: string
  walletNumber: string
  currency: string
  balance: number
  availableBalance: number
  status: "ACTIVE" | "FROZEN"
  createdAt: string
  updatedAt: string
}

export interface TransactionResponse {
  id: string
  reference: string
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "REVERSAL"
  amount: number
  currency: string
  status: "PENDING" | "SUCCESS" | "FAILED" | "REVERSED"
  description?: string
  sourceWalletNumber?: string
  destinationWalletNumber?: string
  fee?: number
  createdAt: string
  completedAt?: string
}

export interface KycResponse {
  id: string
  userId: string
  level: "TIER_1" | "TIER_2" | "TIER_3"
  status: "PENDING" | "APPROVED" | "REJECTED"
  fullName: string
  idType: string
  dateOfBirth: string
  nationality: string
  verifiedAt?: string
  rejectionReason?: string
  createdAt: string
}

export interface NotificationResponse {
  id: string
  userId: string
  type: string
  title: string
  message: string
  referenceId?: string
  channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH" | "ALL"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  isRead: boolean
  createdAt: string
  readAt?: string
  metadata?: Record<string, unknown>
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface DashboardStatsResponse {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  totalWallets: number
  activeWallets: number
  frozenWallets: number
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  pendingTransactions: number
  transactionsLast24h: number
  transactionsLast7d: number
  transactionsLast30d: number
  volumeLast24h: number
  volumeLast7d: number
  volumeLast30d: number
  pendingKyc: number
  rejectedKyc: number
  transactionsByType: Record<string, number>
  generatedAt: string
}
