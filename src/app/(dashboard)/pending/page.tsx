import { Suspense } from 'react'
import { getServerOrders } from '@/lib/serverData'
import { OrdersTable } from '@/components/orders/orders-table'
import { UrlPagination } from '@/components/ui/url-pagination'

export default async function PendingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = Number(searchParams.page) || 1

  const data = await getServerOrders({ status: 'RECEIVED', page, limit: 20 }).catch(() => ({
    data: [],
    pagination: { total: 0, page: 1, limit: 20, pages: 0 },
  }))

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-status-pending/20 bg-status-pending-muted/50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-status-pending">Recibidos</h1>
            <p className="text-sm text-muted-foreground">
              Pedidos recibidos que esperan preparación
            </p>
          </div>
          <div className="text-sm font-medium text-status-pending">
            {data.pagination.total} total
          </div>
        </div>
      </div>

      <OrdersTable data={data.data} />
      {data.pagination.pages > 1 && (
        <Suspense fallback={null}>
          <UrlPagination
            page={data.pagination.page}
            pages={data.pagination.pages}
            total={data.pagination.total}
            limit={data.pagination.limit}
          />
        </Suspense>
      )}
    </div>
  )
}
