'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NON_PENDING_STATUSES, ShipmentStatus, STATUS_LABELS } from '@/types/shipment'

export function ShipmentsFilterBar({ currentStatus }: { currentStatus?: ShipmentStatus }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setStatus(status: ShipmentStatus | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={currentStatus === undefined ? 'default' : 'outline'}
        size="sm"
        onClick={() => setStatus(undefined)}
      >
        Todos
      </Button>
      {NON_PENDING_STATUSES.map((status) => (
        <Button
          key={status}
          variant={currentStatus === status ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus(status)}
          className={cn(
            currentStatus !== status && 'text-muted-foreground'
          )}
        >
          {STATUS_LABELS[status]}
        </Button>
      ))}
    </div>
  )
}
