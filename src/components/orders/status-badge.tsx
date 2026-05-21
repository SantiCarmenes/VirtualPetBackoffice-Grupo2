'use client'

import { Order, OrderStatus, STATUS_LABELS } from '@/types/order'
import { Badge } from '@/components/ui/badge'

const statusStyles: Record<OrderStatus, string> = {
  PENDING: 'bg-status-pending text-status-pending-foreground hover:bg-status-pending/90',
  CONFIRMED: 'bg-status-pending text-status-pending-foreground hover:bg-status-pending/90',
  SHIPPED: 'bg-status-in-transit text-status-in-transit-foreground hover:bg-status-in-transit/90',
  DELIVERED: 'bg-status-delivered text-status-delivered-foreground hover:bg-status-delivered/90',
  CANCELLED: 'bg-status-cancelled text-status-cancelled-foreground hover:bg-status-cancelled/90',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={statusStyles[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
