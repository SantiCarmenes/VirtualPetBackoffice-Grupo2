'use client'

import { useShipments } from '@/hooks/useShipments'
import { ShipmentsTable } from '@/components/shipments/shipments-table'
import { Loader2 } from 'lucide-react'

export default function PendingPage() {
  const { data, isLoading } = useShipments({ status: 'PENDING' })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Envíos Pendientes</h1>
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
        <ShipmentsTable data={data?.data ?? []} />
      )}
    </div>
  )
}
