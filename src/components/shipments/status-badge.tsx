import { Badge } from '@/components/ui/badge'
import { ShipmentStatus, STATUS_LABELS } from '@/types/shipment'

const statusStyles: Record<ShipmentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100',
  IN_TRANSIT: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100',
  DELIVERED: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100',
  FAILED_ATTEMPT_1: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100',
  FAILED_ATTEMPT_2: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100',
  FAILED_ATTEMPT_3: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
  TOTAL_REFUND: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
  PARTIAL_REFUND: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
  MISSING_STOCK: 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100',
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
