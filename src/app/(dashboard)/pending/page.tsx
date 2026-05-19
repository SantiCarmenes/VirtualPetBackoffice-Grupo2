'use client'

import { useState } from 'react'
import { useShipments } from '@/hooks/useShipments'
import { ShipmentsTable } from '@/components/shipments/shipments-table'
import { Pagination } from '@/components/ui/pagination'
import { Loader2 } from 'lucide-react'

export default function PendingPage() {
  const [page, setPage] = useState(1)
  const limit = 20

  // Fetch CONFIRMED orders (displayed as PENDING in UI)
  const { data, isLoading } = useShipments({ status: 'PENDING', page, limit })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Pendientes de Preparación</h1>
        <div className="text-sm text-muted-foreground">
          {data?.total ?? 0} pendientes
        </div>
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
