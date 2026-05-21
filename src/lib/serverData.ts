import { serverFetch } from './serverApi'
import { mapOrderToShipment, mapOrderStatusToQuery } from './shipmentMappers'
import { ShipmentStatus, ShipmentsResponse } from '@/types/shipment'
import { ISSUE_STATUSES } from '@/types/shipment'

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

export async function getServerIssues(page: number = 1, limit: number = 100) {
  const results = await Promise.all(
    ISSUE_STATUSES.map((status) => getServerShipments({ status, page, limit }))
  )

  return {
    data: results.flatMap((r) => r.data),
    total: results.reduce((acc, r) => acc + r.total, 0),
    page: page || 1,
    limit: limit || 10,
  }
}
