import { getServerOrderStats } from '@/lib/serverData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Truck, CheckCircle, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const stats = await getServerOrderStats().catch(() => ({
    RECEIVED: 0, IN_PREPARATION: 0, IN_TRANSIT: 0,
    DELIVERED: 0, NOT_DELIVERED: 0, CANCELLED: 0, total: 0,
  }))

  const pending   = stats.RECEIVED + stats.IN_PREPARATION
  const inTransit = stats.IN_TRANSIT + stats.NOT_DELIVERED
  const finalized = stats.DELIVERED + stats.CANCELLED
  const total     = stats.total

  const STATUSES = [
    {
      key: 'pending',
      label: 'Pendientes',
      sublabel: 'Recibidos y en preparación',
      href: '/orders?status=RECEIVED',
      icon: Package,
      count: pending,
      borderColor: 'border-status-pending',
      bgColor: 'bg-status-pending',
      textColor: 'text-status-pending',
    },
    {
      key: 'inTransit',
      label: 'En Camino',
      sublabel: 'En tránsito o con reintento',
      href: '/orders?status=IN_TRANSIT',
      icon: Truck,
      count: inTransit,
      borderColor: 'border-status-in-transit',
      bgColor: 'bg-status-in-transit',
      textColor: 'text-status-in-transit',
    },
    {
      key: 'finalized',
      label: 'Finalizados',
      sublabel: 'Entregados o cancelados',
      href: '/orders?status=DELIVERED',
      icon: CheckCircle,
      count: finalized,
      borderColor: 'border-status-delivered',
      bgColor: 'bg-status-delivered',
      textColor: 'text-status-delivered',
    },
    {
      key: 'total',
      label: 'Total Pedidos',
      sublabel: 'Todos los pedidos',
      href: '/orders',
      icon: ClipboardList,
      count: total,
      borderColor: 'border-primary',
      bgColor: 'bg-primary',
      textColor: 'text-primary',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1>
        <p className="text-sm text-muted-foreground">Resumen de tus operaciones de envío</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATUSES.map((status) => {
          const Icon = status.icon
          return (
            <Link href={status.href} key={status.key}>
              <Card
                className={cn(
                  'group cursor-pointer border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                  status.borderColor
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {status.label}
                  </CardTitle>
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full',
                      status.bgColor
                    )}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={cn('text-3xl font-bold tracking-tight', status.textColor)}>
                    {status.count}
                  </div>
                  <p className="text-xs text-muted-foreground">{status.sublabel}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/orders?status=RECEIVED">
          <Button variant="outline" className="border-foreground text-foreground hover:bg-muted">
            Ver Recibidos
          </Button>
        </Link>
        <Link href="/orders?status=IN_PREPARATION">
          <Button variant="outline" className="border-foreground text-foreground hover:bg-muted">
            Ver En Preparación
          </Button>
        </Link>
        <Link href="/orders?status=IN_TRANSIT">
          <Button variant="outline" className="border-foreground text-foreground hover:bg-muted">
            Ver En Camino
          </Button>
        </Link>
        <Link href="/orders?status=NOT_DELIVERED">
          <Button variant="outline" className="border-foreground text-foreground hover:bg-muted">
            Ver No Entregados
          </Button>
        </Link>
      </div>
    </div>
  )
}
