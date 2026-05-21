export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'En Tránsito',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export function getAllowedTransitions(currentStatus: OrderStatus): OrderStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || []
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false
}

export interface OrderItem {
  id: string
  variantId: string
  quantity: number
  unitPrice: number
  lineTotal: number
  productNameSnapshot: string
}

export interface ShippingAddress {
  street?: string
  city?: string
  province?: string
  postalCode?: string
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  customerEmail: string
  customerName: string
  shippingAddress: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  createdAt: string
}

export interface OrdersResponse {
  data: Order[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  role: 'USER' | 'BACKOFFICE'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

// --- Shipping Types ---

export type ShippingApiStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'

export interface ShippingMethod {
  id: string
  name: string
  description: string
  cost: number
  estimatedDays: number
  active: boolean
}

export interface ShippingRecord {
  id: string
  orderId: string
  methodId: string
  status: ShippingApiStatus
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
}

// --- Payment Types ---

export interface Payment {
  id: string
  orderId: string
  method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER'
  amount: string
  currency: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED'
  createdAt: string
  updatedAt: string
}

// --- Warehouse Types ---

export interface Warehouse {
  id: string
  name: string
  code: string
  address: Record<string, unknown>
  createdAt: string
  updatedAt: string
}
