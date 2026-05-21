import { apiClient } from '@/lib/apiClient'
import { Payment } from '@/types/order'

export const paymentService = {
  async getPaymentByOrderId(orderId: string): Promise<Payment> {
    return apiClient<Payment>(`/payment/orders/${orderId}`)
  },
}
