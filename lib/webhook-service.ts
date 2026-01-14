import { apiClient, type ApiResponse } from "./api-client"

export interface PaystackWebhookPayload {
  event: string
  data: Record<string, unknown>
}

export interface FlutterwaveWebhookPayload {
  event: string
  data: Record<string, unknown>
}

export class WebhookService {
  async handlePaystackWebhook(payload: PaystackWebhookPayload): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/webhooks/paystack", payload)
  }

  async handleFlutterwaveWebhook(payload: FlutterwaveWebhookPayload): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/webhooks/flutterwave", payload)
  }
}

export const webhookService = new WebhookService()
