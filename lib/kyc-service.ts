import { apiClient, type ApiResponse } from "./api-client"
import type { KycResponse, PageResponse } from "./types"

export interface KycSubmissionRequest {
  level: "TIER_1" | "TIER_2" | "TIER_3"
  fullName: string
  idType: string
  idNumber: string
  dateOfBirth: string
  nationality: string
  address: string
  city: string
  state: string
  postalCode?: string
  country: string
}

export class KycService {
  async submitKyc(
    data: KycSubmissionRequest,
    files: {
      idDocument: File
      proofOfAddress: File
      selfie: File
    },
  ): Promise<ApiResponse<KycResponse>> {
    const formData = new FormData()

    formData.append("kycData", new Blob([JSON.stringify(data)], { type: "application/json" }))
    formData.append("idDocument", files.idDocument)
    formData.append("proofOfAddress", files.proofOfAddress)
    formData.append("selfie", files.selfie)

    const response = await fetch(`${apiClient["baseUrl"]}/kyc/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiClient["token"]}`,
      },
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw result
    }

    return result
  }

  async getKycStatus(): Promise<ApiResponse<KycResponse>> {
    return apiClient.get<KycResponse>("/kyc/status")
  }

  async getKyc(): Promise<ApiResponse<KycResponse>> {
    return apiClient.get<KycResponse>("/kyc")
  }

  async getKycHistory(): Promise<ApiResponse<PageResponse<KycResponse>>> {
    return apiClient.get<PageResponse<KycResponse>>("/kyc/history")
  }
}

export const kycService = new KycService()
