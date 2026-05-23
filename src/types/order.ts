export type OrderStatus =
  | 'RECEIVED'
  | 'IN_PREPARATION'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'NOT_DELIVERED'
  | 'CANCELLED'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: 'Recibido',
  IN_PREPARATION: 'En Preparación',
  IN_TRANSIT: 'En Camino',
  DELIVERED: 'Entregado',
  NOT_DELIVERED: 'No Entregado',
  CANCELLED: 'Cancelado',
}

export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: ['IN_PREPARATION', 'CANCELLED'],
  IN_PREPARATION: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'NOT_DELIVERED'],
  NOT_DELIVERED: ['IN_TRANSIT', 'CANCELLED'],
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
  skuSnapshot?: string
}

export interface ShippingAddress {
  street?: string
  city?: string
  province?: string
  postalCode?: string
  [key: string]: unknown
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
  discountTotal: number
  total: number
  currency: string
  deliveryAttempts: number
  nextDeliveryAt?: string
  createdAt: string
  updatedAt: string
  payment?: Payment | null
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

// --- Stats ---

export interface OrderStats {
  RECEIVED: number
  IN_PREPARATION: number
  IN_TRANSIT: number
  DELIVERED: number
  NOT_DELIVERED: number
  CANCELLED: number
  total: number
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

