import { Badge } from '@/components/ui/badge'
import { ShipmentStatus, STATUS_LABELS } from '@/types/shipment'

const statusStyles: Record<ShipmentStatus, string> = {
  PENDING: 'bg-status-pending text-status-pending-foreground hover:bg-status-pending/90',
  IN_TRANSIT: 'bg-status-in-transit text-status-in-transit-foreground hover:bg-status-in-transit/90',
  DELIVERED: 'bg-status-delivered text-status-delivered-foreground hover:bg-status-delivered/90',
  FAILED_ATTEMPT_1: 'bg-status-pending text-status-pending-foreground hover:bg-status-pending/90',
  FAILED_ATTEMPT_2: 'bg-status-pending text-status-pending-foreground hover:bg-status-pending/90',
  FAILED_ATTEMPT_3: 'bg-status-cancelled text-status-cancelled-foreground hover:bg-status-cancelled/90',
  FAILED_DELIVERY: 'bg-status-cancelled text-status-cancelled-foreground hover:bg-status-cancelled/90',
  MISSING_STOCK: 'bg-muted text-muted-foreground hover:bg-muted/90',
  CANCELLED: 'bg-status-cancelled text-status-cancelled-foreground hover:bg-status-cancelled/90',
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <Badge className={statusStyles[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
