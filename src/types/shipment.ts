export type ShipmentStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED_ATTEMPT_1'
  | 'FAILED_ATTEMPT_2'
  | 'FAILED_ATTEMPT_3'
  | 'FAILED_DELIVERY'
  | 'MISSING_STOCK'
  | 'CANCELLED'

export const ACTIVE_STATUSES: ShipmentStatus[] = [
  'PENDING',
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED_ATTEMPT_1',
  'FAILED_ATTEMPT_2',
  'FAILED_ATTEMPT_3',
  'FAILED_DELIVERY',
  'MISSING_STOCK',
  'CANCELLED',
]

export const NON_PENDING_STATUSES: ShipmentStatus[] = [
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED_ATTEMPT_1',
  'FAILED_ATTEMPT_2',
  'FAILED_ATTEMPT_3',
  'FAILED_DELIVERY',
  'CANCELLED',
]

export const ISSUE_STATUSES: ShipmentStatus[] = [
  'CANCELLED',
]

export interface Product {
  id: string
  name: string
  sku: string
  quantity: number
  packed?: boolean
}

export interface Shipment {
  id: string
  orderId: string
  customerName: string
  customerEmail: string
  shippingAddress: ShippingAddress
  status: ShipmentStatus
  products: Product[]
  createdAt: string
  updatedAt: string
  operatorName?: string
  logisticsType?: string
  // Shipping record info (from API)
  shippingId?: string
  shippingStatus?: ShippingApiStatus
  shippingMethodName?: string
  shippingEstimatedDelivery?: string
}

export type LogisticsType =
  | 'INTERNAL_DELIVERY'
  | 'COURIER_1'
  | 'COURIER_2'

export interface FulfillmentPayload {
  shipmentId: string
  operatorName: string
  logisticsType: string
  packedProductIds: string[]
  discrepancy: boolean
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
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

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: 'Pendiente',
  IN_TRANSIT: 'En Tránsito',
  DELIVERED: 'Entregado',
  FAILED_ATTEMPT_1: 'Intento Fallido 1',
  FAILED_ATTEMPT_2: 'Intento Fallido 2',
  FAILED_ATTEMPT_3: 'Intento Fallido 3',
  FAILED_DELIVERY: 'Entrega Fallida',
  MISSING_STOCK: 'Stock Faltante',
  CANCELLED: 'Cancelado',
}

export const LOGISTICS_LABELS: Record<LogisticsType, string> = {
  INTERNAL_DELIVERY: 'Entrega Interna',
  COURIER_1: 'Mensajería 1',
  COURIER_2: 'Mensajería 2',
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

// --- API Order Types ---

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

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
  userId?: string
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
