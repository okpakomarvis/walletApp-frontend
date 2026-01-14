import { apiClient, type ApiResponse } from "./api-client"
import type { TransactionResponse, PageResponse } from "./types"

export interface TransferRequest {
  sourceWalletId: string
  destinationWalletNumber: string
  amount: number
  description?: string
  pin: string
  ipAddress?: string
}

export interface WithdrawalRequest {
  walletId: string
  amount: number
  bankAccount: string
  bankCode?: string
  accountNumber: string
  accountName: string
  narration?: string
  pin: string
}

export interface DepositRequest {
  walletId: string
  amount: number
  paymentMethod: string
  paymentReference?: string
  gateway?: string
}

export interface VerifyPinRequest {
  pin: string
}

export interface TransactionDetailResponse {
  transaction: TransactionResponse
  ledgerEntries: LedgerResponse[]
}

export interface LedgerResponse {
  id: string
  entryType: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  description?: string
  createdAt: string
}

export class TransactionService {
  async transfer(data: TransferRequest): Promise<ApiResponse<TransactionResponse>> {
    return apiClient.post<TransactionResponse>("/transactions/transfer", data)
  }

  async deposit(data: DepositRequest): Promise<ApiResponse<TransactionResponse>> {
    return apiClient.post<TransactionResponse>("/transactions/deposit", data)
  }

  async withdraw(data: WithdrawalRequest): Promise<ApiResponse<TransactionResponse>> {
    return apiClient.post<TransactionResponse>("/transactions/withdraw", data)
  }

  async getTransactions(page = 0, size = 20): Promise<ApiResponse<PageResponse<TransactionResponse>>> {
    return apiClient.get<PageResponse<TransactionResponse>>(`/transactions?page=${page}&size=${size}`)
  }

  async getTransaction(transactionId: string): Promise<ApiResponse<TransactionResponse>> {
    return apiClient.get<TransactionResponse>(`/transactions/${transactionId}`)
  }

  async getTransactionByReference(reference: string): Promise<ApiResponse<TransactionResponse>> {
    return apiClient.get<TransactionResponse>(`/transactions/reference/${reference}`)
  }

  async verifyPin(transactionId: string, data: VerifyPinRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/transactions/${transactionId}/verify-pin`, data)
  }

  async getTransactionDetail(reference: string): Promise<ApiResponse<TransactionDetailResponse>> {
    return apiClient.get<TransactionDetailResponse>(`/transactions/${reference}`)
  }
}

export const transactionService = new TransactionService()
