import { apiClient } from '@/lib/apiClient'
import { ShippingMethod, ShippingRecord } from '@/types/shipment'

export const shippingService = {
  async getMethods(): Promise<ShippingMethod[]> {
    return apiClient<ShippingMethod[]>('/shipping/methods')
  },

  async getShippingByOrderId(orderId: string): Promise<ShippingRecord> {
    return apiClient<ShippingRecord>(`/shipping/orders/${orderId}`)
  },

  async createShipping(payload: {
    orderId: string
    methodId: string
    estimatedDelivery?: string
  }): Promise<ShippingRecord> {
    return apiClient<ShippingRecord>('/shipping', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async updateShippingStatus(
    orderId: string,
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'
  ): Promise<ShippingRecord> {
    return apiClient<ShippingRecord>(`/shipping/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}
