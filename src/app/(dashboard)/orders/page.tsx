import { Suspense } from 'react'
import { getServerOrders } from '@/lib/serverData'
import { OrdersTable } from '@/components/orders/orders-table'
import { OrdersFilterBar } from '@/components/orders/orders-filter-bar'
import { UrlPagination } from '@/components/ui/url-pagination'
import { OrderStatus } from '@/types/order'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = Number(searchParams.page) || 1
  const status = (searchParams.status as OrderStatus) || undefined

  const data = await getServerOrders({ status, page, limit: 20 }).catch(() => ({
    data: [],
    pagination: { total: 0, page: 1, limit: 20, pages: 0 },
  }))

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Pedidos</h1>
            <p className="text-sm text-muted-foreground">
              Gestión de pedidos y estados
            </p>
          </div>
          <div className="text-sm font-medium text-primary">
            {data.pagination.total} total
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <OrdersFilterBar currentStatus={status} />
      </Suspense>
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
