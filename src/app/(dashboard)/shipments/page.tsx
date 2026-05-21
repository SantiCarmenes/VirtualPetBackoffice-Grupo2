import { getServerShipments } from '@/lib/serverData'
import { ShipmentsTable } from '@/components/shipments/shipments-table'
import { ShipmentsFilterBar } from '@/components/shipments/shipments-filter-bar'
import { UrlPagination } from '@/components/ui/url-pagination'
import { ShipmentStatus } from '@/types/shipment'

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = Number(searchParams.page) || 1
  const status = (searchParams.status as ShipmentStatus) || undefined

  const data = await getServerShipments({ status, page, limit: 20 })

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-status-in-transit/20 bg-status-in-transit-muted/50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-status-in-transit">Envíos</h1>
            <p className="text-sm text-muted-foreground">Gestión de pedidos en tránsito y entregados</p>
          </div>
          <div className="text-sm font-medium text-status-in-transit">
            {data.total} total
          </div>
        </div>
      </div>

      <ShipmentsFilterBar currentStatus={status} />
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
