'use client'

import { useState } from 'react'
import { useShipments } from '@/hooks/useShipments'
import { ShipmentsTable } from '@/components/shipments/shipments-table'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NON_PENDING_STATUSES, ShipmentStatus, STATUS_LABELS } from '@/types/shipment'

export default function ShipmentsContent() {
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | undefined>(undefined)
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useShipments({ status: statusFilter, page, limit })

  function handleStatusChange(status: ShipmentStatus | undefined) {
    setStatusFilter(status)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Envíos</h1>
        <div className="text-sm text-muted-foreground">
          {data?.total ?? 0} total
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleStatusChange(undefined)}
        >
          Todos
        </Button>
        {NON_PENDING_STATUSES.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange(status)}
            className={cn(
              statusFilter !== status && 'text-muted-foreground'
            )}
          >
            {STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <ShipmentsTable data={data?.data ?? []} />
          {data && data.pages > 1 && (
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              limit={data.limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}
