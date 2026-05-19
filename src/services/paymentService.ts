import { apiClient } from '@/lib/apiClient'

export interface Payment {
  id: string
  orderId: string
  method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER'
  amount: string
  currency: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED'
  createdAt: string
  updatedAt: string
}

export const paymentService = {
  async getPaymentByOrderId(orderId: string): Promise<Payment> {
    return apiClient<Payment>(`/payment/orders/${orderId}`)
  },
}
