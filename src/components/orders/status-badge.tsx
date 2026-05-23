'use client'

import { OrderStatus, STATUS_LABELS } from '@/types/order'
import { Badge } from '@/components/ui/badge'

const statusStyles: Record<OrderStatus, string> = {
  RECEIVED: 'bg-status-pending text-status-pending-foreground hover:bg-status-pending/90',
  IN_PREPARATION: 'bg-status-pending text-status-pending-foreground hover:bg-status-pending/90',
  IN_TRANSIT: 'bg-status-in-transit text-status-in-transit-foreground hover:bg-status-in-transit/90',
  DELIVERED: 'bg-status-delivered text-status-delivered-foreground hover:bg-status-delivered/90',
  NOT_DELIVERED: 'bg-amber-500 text-white hover:bg-amber-500/90',
  CANCELLED: 'bg-status-cancelled text-status-cancelled-foreground hover:bg-status-cancelled/90',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={statusStyles[status] ?? 'bg-muted text-muted-foreground'}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
