'use client'

import { OrderStatus, STATUS_LABELS } from '@/types/order'
import { Badge } from '@/components/ui/badge'

const statusStyles: Record<OrderStatus, string> = {
  RECEIVED: 'bg-slate-500 text-white hover:bg-slate-600',
  IN_PREPARATION: 'bg-orange-500 text-white hover:bg-orange-600',
  IN_TRANSIT: 'bg-status-in-transit text-status-in-transit-foreground hover:bg-blue-600',
  DELIVERED: 'bg-status-delivered text-status-delivered-foreground hover:bg-green-600',
  NOT_DELIVERED: 'bg-rose-500 text-white hover:bg-rose-600',
  CANCELLED: 'bg-status-cancelled text-status-cancelled-foreground hover:bg-red-700',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={`whitespace-nowrap ${statusStyles[status] ?? 'bg-muted text-muted-foreground'}`}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
