import { Order, OrderStatus, Shipment, ShipmentStatus, ShippingApiStatus, ShippingRecord } from '@/types/shipment'

export function mapOrderStatus(orderStatus: OrderStatus, shippingStatus?: ShippingApiStatus): ShipmentStatus {
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

export function mapOrderToShipment(order: Order, shippingRecord?: ShippingRecord): Shipment {
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

export function mapOrderStatusToQuery(status?: ShipmentStatus): OrderStatus | undefined {
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
