import { apiClient } from '@/lib/apiClient'
import { orderService } from './orderService'
import { shippingService } from './shippingService'
import { OrderStatus, Shipment, ShippingApiStatus } from '@/types/shipment'

export const fulfillmentService = {
  async createShippingRecord(payload: {
    orderId: string
    methodId: string
    estimatedDelivery?: string
  }): Promise<Shipment> {
    await shippingService.createShipping(payload)
    const order = await orderService.getOrderById(payload.orderId)
    const shipping = await shippingService.getShippingByOrderId(payload.orderId)
    return {
      id: order.id,
      orderId: order.id.slice(0, 8).toUpperCase(),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      status: 'PENDING',
      products: order.items.map((item) => ({
        id: item.variantId,
        name: item.productNameSnapshot,
        sku: item.variantId.slice(0, 8).toUpperCase(),
        quantity: item.quantity,
        packed: false,
      })),
      createdAt: order.createdAt,
      updatedAt: order.createdAt,
      shippingId: shipping.id,
      shippingStatus: shipping.status as ShippingApiStatus,
      shippingEstimatedDelivery: shipping.estimatedDelivery,
    }
  },

  async updateShippingStatus(payload: {
    orderId: string
    status: ShippingApiStatus
    updateOrderStatus?: OrderStatus
  }): Promise<Shipment> {
    await shippingService.updateShippingStatus(payload.orderId, payload.status)

    if (payload.updateOrderStatus) {
      await orderService.updateOrderStatus(payload.orderId, payload.updateOrderStatus)
    }

    const order = await orderService.getOrderById(payload.orderId)
    const shipping = await shippingService.getShippingByOrderId(payload.orderId)

    return {
      id: order.id,
      orderId: order.id.slice(0, 8).toUpperCase(),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      status: payload.updateOrderStatus === 'SHIPPED'
        ? 'IN_TRANSIT'
        : payload.updateOrderStatus === 'DELIVERED'
        ? 'DELIVERED'
        : 'PENDING',
      products: order.items.map((item) => ({
        id: item.variantId,
        name: item.productNameSnapshot,
        sku: item.variantId.slice(0, 8).toUpperCase(),
        quantity: item.quantity,
        packed: false,
      })),
      createdAt: order.createdAt,
      updatedAt: order.createdAt,
      shippingId: shipping.id,
      shippingStatus: shipping.status as ShippingApiStatus,
      shippingEstimatedDelivery: shipping.estimatedDelivery,
    }
  },

  async submitFulfillment(payload: {
    shipmentId: string
    operatorName: string
    logisticsType: string
    packedProductIds: string[]
    discrepancy: boolean
  }): Promise<Shipment> {
    const nextStatus: OrderStatus = payload.discrepancy ? 'CANCELLED' : 'SHIPPED'

    return apiClient<Shipment>(`/orders/${payload.shipmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    })
  },
}
