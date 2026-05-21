import { orderService } from './orderService'
import { shippingService } from './shippingService'
import { Shipment, ShipmentStatus } from '@/types/shipment'
import { mapOrderToShipment, mapOrderStatusToQuery } from '@/lib/shipmentMappers'

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
