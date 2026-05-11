'use client'

import { useIssues } from '@/hooks/useIssues'
import { IssuesTable } from '@/components/issues/issues-table'
import { Loader2 } from 'lucide-react'

export default function IssuesPage() {
  const { data, isLoading } = useIssues()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Incidencias</h1>
          <p className="text-sm text-muted-foreground">
            Envíos que requieren reembolso o con stock faltante
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {data?.total ?? 0} incidencias
        </div>
      </div>

      {/* Issue Type Summary */}
      {!isLoading && data?.data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-red-600">
              {data.data.filter((s) => s.status === 'TOTAL_REFUND').length}
            </div>
            <div className="text-xs text-muted-foreground">Reembolsos Totales</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-red-600">
              {data.data.filter((s) => s.status === 'PARTIAL_REFUND').length}
            </div>
            <div className="text-xs text-muted-foreground">Reembolsos Parciales</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-gray-600">
              {data.data.filter((s) => s.status === 'MISSING_STOCK').length}
            </div>
            <div className="text-xs text-muted-foreground">Stock Faltante</div>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <IssuesTable data={data?.data ?? []} />
      )}
    </div>
  )
}
