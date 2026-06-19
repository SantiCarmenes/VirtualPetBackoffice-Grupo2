import { apiClient } from '@/lib/apiClient'
import { Order, OrdersResponse, OrderStatus } from '@/types/order'

export const orderService = {
  async getOrders(params?: {
    status?: OrderStatus
    page?: number
    limit?: number
    sort?: string
  }): Promise<OrdersResponse> {
    return apiClient<OrdersResponse>('/orders/all', {
      params: {
        ...(params?.status && { status: params.status }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
        ...(params?.sort && { sort: params.sort }),
      },
    })
  },

  async getOrderById(id: string): Promise<Order> {
    return apiClient<Order>(`/orders/${id}`)
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return apiClient<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  async markAsInvoiced(id: string): Promise<Order> {
    return apiClient<Order>(`/orders/${id}/invoiced`, {
      method: 'PATCH',
    })
  },
}
