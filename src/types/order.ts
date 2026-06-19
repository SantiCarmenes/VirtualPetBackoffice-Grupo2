export type OrderStatus =
  | 'RECEIVED'
  | 'IN_PREPARATION'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'NOT_DELIVERED'
  | 'CANCELLED'

export type InvoiceStatus = 'NONE' | 'REQUIRED' | 'DONE'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: 'Recibido',
  IN_PREPARATION: 'Preparado',
  IN_TRANSIT: 'En Camino',
  DELIVERED: 'Entregado',
  NOT_DELIVERED: 'No Entregado',
  CANCELLED: 'Cancelado',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  NONE: 'No solicitada',
  REQUIRED: 'Requiere factura',
  DONE: 'Facturado',
}

export const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  IN_PREPARATION: 'Marcar como Preparado',
  CANCELLED: 'Cancelar',
}

export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: ['IN_PREPARATION', 'CANCELLED'],
  IN_PREPARATION: ['CANCELLED'],
  IN_TRANSIT: [],
  NOT_DELIVERED: ['CANCELLED'],
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

export interface Shipment {
  id: string
  orderId: string
  methodId: string
  methodName: string
  riderId: string | null
  riderName: string | null
  takenAt: string | null
  status: string
  trackingNumber: string | null
  estimatedDelivery: string | null
  createdAt: string
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
  invoiceStatus: InvoiceStatus
  invoiceCuit?: string | null
  createdAt: string
  updatedAt: string
  payment?: Payment | null
  shipment?: Shipment | null
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
