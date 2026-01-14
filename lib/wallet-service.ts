import { apiClient, type ApiResponse } from "./api-client"
import type { WalletResponse } from "./types"

export interface CreateWalletRequest {
  currency: string
}

export interface BalanceResponse {
  walletId: string
  balance: number
  currency: string
  availableBalance: number
  pendingBalance: number
}

export class WalletService {
  async getWallets(): Promise<ApiResponse<WalletResponse[]>> {
    return apiClient.get<WalletResponse[]>("/wallets")
  }

  async createWallet(data: CreateWalletRequest): Promise<ApiResponse<WalletResponse>> {
    return apiClient.post<WalletResponse>("/wallets", data)
  }

  async getWallet(walletId: string): Promise<ApiResponse<WalletResponse>> {
    return apiClient.get<WalletResponse>(`/wallets/${walletId}`)
  }

  async getWalletBalance(walletId: string): Promise<ApiResponse<BalanceResponse>> {
    return apiClient.get<BalanceResponse>(`/wallets/${walletId}/balance`)
  }

  async getUserWallets(userId: string): Promise<ApiResponse<WalletResponse[]>> {
    return apiClient.get<WalletResponse[]>(`/wallets/user/${userId}`)
  }

  async freezeWallet(walletId: string): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/wallets/${walletId}/freeze`)
  }

  async unfreezeWallet(walletId: string): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/wallets/${walletId}/unfreeze`)
  }
}

export const walletService = new WalletService()
