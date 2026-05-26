'use client'

import { useTransition } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OrderStatus, STATUS_LABELS } from '@/types/order'
import { RefreshCw } from 'lucide-react'

const ALL_STATUSES: OrderStatus[] = [
  'RECEIVED',
  'IN_PREPARATION',
  'IN_TRANSIT',
  'NOT_DELIVERED',
  'DELIVERED',
  'CANCELLED',
]

export function OrdersFilterBar({ currentStatus }: { currentStatus?: OrderStatus }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function setStatus(status: OrderStatus | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleRefresh() {
    startTransition(() => {
      router.refresh()
    })
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
      {ALL_STATUSES.map((status) => (
        <Button
          key={status}
          variant={currentStatus === status ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus(status)}
          className={cn(currentStatus !== status && 'text-muted-foreground')}
        >
          {STATUS_LABELS[status]}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isPending}
      >
        <RefreshCw className={cn('mr-2 h-4 w-4', isPending && 'animate-spin')} />
        Actualizar
      </Button>
    </div>
  )
}
