'use client'

import { useState } from 'react'
import { useShipments } from '@/hooks/useShipments'
import { IssuesTable } from '@/components/issues/issues-table'
import { Pagination } from '@/components/ui/pagination'
import { Loader2 } from 'lucide-react'

export default function IssuesContent() {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useShipments({ status: 'CANCELLED', page, limit })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Incidencias</h1>
          <p className="text-sm text-muted-foreground">
            Pedidos cancelados y problemas de envío
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {data?.total ?? 0} incidencias
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <IssuesTable data={data?.data ?? []} />
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
