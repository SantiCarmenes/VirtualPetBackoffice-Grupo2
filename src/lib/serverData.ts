import { serverFetch } from './serverApi'
import { Order, OrdersResponse, OrderStats, OrderStatus, User } from '@/types/order'

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
    next: { revalidate: 30, tags: ['orders'] },
  } as RequestInit)
}

export async function getServerOrderStats(): Promise<OrderStats> {
  return serverFetch<OrderStats>('/orders/stats', {
    next: { revalidate: 30, tags: ['orders'] },
  } as RequestInit)
}

export async function getServerOrderById(id: string): Promise<Order | null> {
  try {
    return await serverFetch<Order>(`/orders/${id}`, {
      next: { tags: ['orders'] },
    } as RequestInit)
  } catch (err: any) {
    if (err?.status === 404) return null
    throw err
  }
}

export async function getServerUser(): Promise<User> {
  return serverFetch<User>('/users/me', {
    next: { revalidate: 3600 },
  } as RequestInit)
}
