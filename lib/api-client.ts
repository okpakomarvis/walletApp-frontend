// API Client for wallet service
const API_BASE_URL = "/api/proxy" // Use Next.js API route as proxy

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("accessToken")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    const fullUrl = `${this.baseUrl}${normalizedEndpoint}`

    console.log("[v0] API Request:", {
      baseUrl: this.baseUrl,
      endpoint: normalizedEndpoint,
      fullUrl,
      method: options.method || "GET",
      hasToken: !!this.token,
    })

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      })

      console.log("[v0] API Response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (response.status === 401) {
        this.clearToken()
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login"
        }
      }

      const data = await response.json()

      console.log("[v0] Response data:", data)

      if (!response.ok) {
        throw data
      }

      return data
    } catch (error) {
      console.error("[v0] API Request failed:", error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
