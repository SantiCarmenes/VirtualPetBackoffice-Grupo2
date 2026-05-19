import { orderService } from './orderService'
import { shippingService } from './shippingService'
import { OrderStatus, Shipment, ShipmentStatus, ShippingApiStatus } from '@/types/shipment'

function mapOrderStatus(orderStatus: OrderStatus, shippingStatus?: ShippingApiStatus): ShipmentStatus {
  if (orderStatus === 'CANCELLED') return 'CANCELLED'
  if (orderStatus === 'DELIVERED') return 'DELIVERED'
  if (orderStatus === 'SHIPPED') return 'IN_TRANSIT'
  if (orderStatus === 'CONFIRMED') {
    if (!shippingStatus) return 'PENDING'
    if (shippingStatus === 'PENDING') return 'PENDING'
    if (shippingStatus === 'PROCESSING') return 'PENDING'
    return 'PENDING'
  }
  return 'PENDING'
}

function mapOrderToShipment(order: Awaited<ReturnType<typeof orderService.getOrderById>>, shippingRecord?: Awaited<ReturnType<typeof shippingService.getShippingByOrderId>>): Shipment {
  return {
    id: order.id,
    orderId: order.id.slice(0, 8).toUpperCase(),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    shippingAddress: order.shippingAddress,
    status: mapOrderStatus(order.status, shippingRecord?.status),
    products: order.items.map((item) => ({
      id: item.variantId,
      name: item.productNameSnapshot,
      sku: item.variantId.slice(0, 8).toUpperCase(),
      quantity: item.quantity,
      packed: false,
    })),
    createdAt: order.createdAt,
    updatedAt: order.createdAt,
    shippingId: shippingRecord?.id,
    shippingStatus: shippingRecord?.status,
    shippingMethodName: undefined,
    shippingEstimatedDelivery: shippingRecord?.estimatedDelivery,
  }
}

function mapOrderStatusToQuery(status?: ShipmentStatus): OrderStatus | undefined {
  switch (status) {
    case 'PENDING':
      return 'CONFIRMED'
    case 'IN_TRANSIT':
      return 'SHIPPED'
    case 'DELIVERED':
      return 'DELIVERED'
    case 'CANCELLED':
      return 'CANCELLED'
    default:
      return undefined
  }
}

interface GetShipmentsParams {
  status?: ShipmentStatus
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface ShipmentsResponse {
  data: Shipment[]
  total: number
  page: number
  limit: number
  pages: number
}

export const shipmentService = {
  async getShipments(params?: GetShipmentsParams): Promise<ShipmentsResponse> {
    const orderStatus = mapOrderStatusToQuery(params?.status)

    const response = await orderService.getOrders({
      status: orderStatus,
      page: params?.page,
      limit: params?.limit,
      sort: params?.sortBy
        ? `${params.sortBy}:${params.sortOrder ?? 'desc'}`
        : undefined,
    })

    return {
      data: response.data.map((order) => mapOrderToShipment(order)),
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      pages: response.pagination.pages,
    }
  },

  async getShipmentById(id: string): Promise<Shipment> {
    const [order, shippingRecord] = await Promise.all([
      orderService.getOrderById(id),
      shippingService.getShippingByOrderId(id).catch(() => undefined),
    ])
    return mapOrderToShipment(order, shippingRecord)
  },
}
