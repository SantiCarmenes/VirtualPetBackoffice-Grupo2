import { serverFetch } from './serverApi'
import { mapOrderToShipment, mapOrderStatusToQuery } from './shipmentMappers'
import { ShipmentStatus, ShipmentsResponse, User, Order, ShippingRecord, Shipment } from '@/types/shipment'

interface GetShipmentsParams {
  status?: ShipmentStatus
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export async function getServerShipments(params?: GetShipmentsParams): Promise<ShipmentsResponse> {
  const orderStatus = mapOrderStatusToQuery(params?.status)

  const searchParams = new URLSearchParams()
  if (orderStatus) searchParams.set('status', orderStatus)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.sortBy) {
    searchParams.set('sort', `${params.sortBy}:${params.sortOrder ?? 'desc'}`)
  }

  const queryString = searchParams.toString()
  const path = `/orders/all${queryString ? '?' + queryString : ''}`

  const response = await serverFetch<any>(path)

  return {
    data: response.data.map((order: any) => mapOrderToShipment(order)),
    total: response.pagination.total,
    page: response.pagination.page,
    limit: response.pagination.limit,
    pages: response.pagination.pages,
  }
}

export async function getServerUser(): Promise<User> {
  return serverFetch<User>('/users/me')
}

export async function getServerShipmentById(id: string): Promise<Shipment> {
  const [order, shippingRecord] = await Promise.all([
    serverFetch<Order>(`/orders/${id}`),
    serverFetch<ShippingRecord>(`/shipping/orders/${id}`).catch(() => undefined),
  ])
  return mapOrderToShipment(order, shippingRecord)
}
