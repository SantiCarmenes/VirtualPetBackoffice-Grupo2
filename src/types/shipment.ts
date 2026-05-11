export type ShipmentStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED_ATTEMPT_1'
  | 'FAILED_ATTEMPT_2'
  | 'FAILED_ATTEMPT_3'
  | 'TOTAL_REFUND'
  | 'PARTIAL_REFUND'
  | 'MISSING_STOCK'

export const ACTIVE_STATUSES: ShipmentStatus[] = [
  'PENDING',
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED_ATTEMPT_1',
  'FAILED_ATTEMPT_2',
  'FAILED_ATTEMPT_3',
]

export const NON_PENDING_STATUSES: ShipmentStatus[] = [
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED_ATTEMPT_1',
  'FAILED_ATTEMPT_2',
  'FAILED_ATTEMPT_3',
]

export const ISSUE_STATUSES: ShipmentStatus[] = [
  'TOTAL_REFUND',
  'PARTIAL_REFUND',
  'MISSING_STOCK',
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
  status: ShipmentStatus
  products: Product[]
  createdAt: string
  updatedAt: string
  operatorName?: string
  logisticsType?: LogisticsType
}

export type LogisticsType =
  | 'INTERNAL_DELIVERY'
  | 'COURIER_1'
  | 'COURIER_2'

export interface FulfillmentPayload {
  shipmentId: string
  operatorName: string
  logisticsType: LogisticsType
  packedProductIds: string[]
  discrepancy: boolean
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: 'Pendiente',
  IN_TRANSIT: 'En Tránsito',
  DELIVERED: 'Entregado',
  FAILED_ATTEMPT_1: 'Intento Fallido 1',
  FAILED_ATTEMPT_2: 'Intento Fallido 2',
  FAILED_ATTEMPT_3: 'Intento Fallido 3',
  TOTAL_REFUND: 'Reembolso Total',
  PARTIAL_REFUND: 'Reembolso Parcial',
  MISSING_STOCK: 'Stock Faltante',
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
