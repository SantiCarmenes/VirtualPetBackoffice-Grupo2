import { serverFetch } from './serverApi'
import {
  Order,
  OrdersResponse,
  OrderStatus,
  User,
  ShippingRecord,
  ShippingMethod,
  Payment,
  Warehouse,
} from '@/types/order'

interface GetOrdersParams {
  status?: OrderStatus
  page?: number
  limit?: number
  sort?: string
}

export async function getServerOrders(params?: GetOrdersParams): Promise<OrdersResponse> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.sort) searchParams.set('sort', params.sort)

  const queryString = searchParams.toString()
  const path = `/orders/all${queryString ? '?' + queryString : ''}`

  return serverFetch<OrdersResponse>(path, {
    next: { revalidate: 1200, tags: ['orders'] },
  })
}

export async function getServerOrderById(id: string): Promise<Order> {
  return serverFetch<Order>(`/orders/${id}`)
}

export async function getServerUser(): Promise<User> {
  return serverFetch<User>('/users/me')
}

export async function getServerShippingRecord(orderId: string): Promise<ShippingRecord | null> {
  try {
    return await serverFetch<ShippingRecord>(`/shipping/orders/${orderId}`)
  } catch {
    return null
  }
}

export async function getServerShippingMethods(): Promise<ShippingMethod[]> {
  return serverFetch<ShippingMethod[]>('/shipping/methods')
}

export async function getServerPayment(orderId: string): Promise<Payment | null> {
  try {
    return await serverFetch<Payment>(`/payment/orders/${orderId}`)
  } catch {
    return null
  }
}

export async function getServerWarehouses(): Promise<Warehouse[]> {
  return serverFetch<Warehouse[]>('/warehouses')
}

export async function getServerUsers(): Promise<User[]> {
  return serverFetch<User[]>('/users')
}
