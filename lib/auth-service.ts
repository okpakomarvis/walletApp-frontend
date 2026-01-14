import { apiClient, type ApiResponse } from "./api-client"
import type { AuthResponse, UserResponse } from "./types"

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
}

export interface LoginRequest {
  email: string
  password: string
  mfaCode?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface SetPinRequest {
  pin: string
  confirmPin: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  dateOfBirth?: string
  address?: string
}

export interface VerifyMfaRequest {
  code: string
}

export class AuthService {
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data)
    if (response.success && response.data.accessToken) {
      apiClient.setToken(response.data.accessToken)
      if (typeof window !== "undefined") {
        localStorage.setItem("refreshToken", response.data.refreshToken)
      }
    }
    return response
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data)
    if (response.success && response.data.accessToken) {
      apiClient.setToken(response.data.accessToken)
      if (typeof window !== "undefined") {
        localStorage.setItem("refreshToken", response.data.refreshToken)
      }
    }
    return response
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>("/auth/refresh", { refreshToken })
    if (response.success && response.data.accessToken) {
      apiClient.setToken(response.data.accessToken)
      if (typeof window !== "undefined") {
        localStorage.setItem("refreshToken", response.data.refreshToken)
      }
    }
    return response
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>("/auth/logout")
      return response
    } finally {
      apiClient.clearToken()
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/forgot-password", data)
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/reset-password", data)
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.get<void>(`/auth/verify-email?token=${token}`)
  }

  async resendVerification(): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/resend-verification")
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.put<void>("/auth/change-password", data)
  }

  async setPin(data: SetPinRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/set-pin", data)
  }

  async getProfile(): Promise<ApiResponse<UserResponse>> {
    return apiClient.get<UserResponse>("/auth/me")
  }

  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return this.getProfile()
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserResponse>> {
    return apiClient.put<UserResponse>("/auth/profile", data)
  }

  async enableMfa(): Promise<ApiResponse<{ qrCode: string; secret: string }>> {
    return apiClient.put<{ qrCode: string; secret: string }>("/auth/mfa/enable")
  }

  async disableMfa(): Promise<ApiResponse<void>> {
    return apiClient.put<void>("/auth/mfa/disable")
  }

  async verifyMfa(data: VerifyMfaRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/mfa/verify", data)
  }

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem("accessToken")
  }
}

export const authService = new AuthService()
