import { getServerShipments } from '@/lib/serverData'
import { ShipmentsTable } from '@/components/shipments/shipments-table'
import { UrlPagination } from '@/components/ui/url-pagination'

export default async function PendingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = Number(searchParams.page) || 1

  const data = await getServerShipments({ status: 'PENDING', page, limit: 20 })

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-status-pending/20 bg-status-pending-muted/50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-status-pending">Pendientes de Preparación</h1>
            <p className="text-sm text-muted-foreground">Pedidos confirmados esperando preparación y empaque</p>
          </div>
          <div className="text-sm font-medium text-status-pending">
            {data.total} pendientes
          </div>
        </div>
      </div>

      <ShipmentsTable data={data.data} />
      {data.pages > 1 && (
        <UrlPagination
          page={data.page}
          pages={data.pages}
          total={data.total}
          limit={data.limit}
        />
      )}
    </div>
  )
}
