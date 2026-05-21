import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Truck, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ShipmentsResponse } from '@/types/shipment'

const STATUSES = [
  {
    key: 'pending',
    label: 'Pendientes',
    sublabel: 'Esperando preparación',
    href: '/pending',
    icon: Package,
    count: (data: any[]) => data.filter((s) => s.status === 'PENDING').length,
    color: 'status-pending',
    borderColor: 'border-status-pending',
    bgColor: 'bg-status-pending',
    textColor: 'text-status-pending',
    mutedBg: 'bg-status-pending-muted',
  },
  {
    key: 'inTransit',
    label: 'En Tránsito',
    sublabel: 'En camino',
    href: '/shipments',
    icon: Truck,
    count: (data: any[]) => data.filter((s) => s.status === 'IN_TRANSIT').length,
    color: 'status-in-transit',
    borderColor: 'border-status-in-transit',
    bgColor: 'bg-status-in-transit',
    textColor: 'text-status-in-transit',
    mutedBg: 'bg-status-in-transit-muted',
  },
  {
    key: 'delivered',
    label: 'Entregados',
    sublabel: 'Completados',
    href: '/shipments',
    icon: CheckCircle,
    count: (data: any[]) => data.filter((s) => s.status === 'DELIVERED').length,
    color: 'status-delivered',
    borderColor: 'border-status-delivered',
    bgColor: 'bg-status-delivered',
    textColor: 'text-status-delivered',
    mutedBg: 'bg-status-delivered-muted',
  },
]

interface DashboardContentProps {
  shipments: ShipmentsResponse
}

export default function DashboardContent({ shipments }: DashboardContentProps) {
  const allShipments = shipments.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1>
        <p className="text-sm text-muted-foreground">Resumen de tus operaciones de envío</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATUSES.map((status) => {
          const Icon = status.icon
          const count = status.count(allShipments)

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
                    {count}
                  </div>
                  <p className="text-xs text-muted-foreground">{status.sublabel}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/pending">
          <Button variant="outline" className="border-status-pending text-status-pending hover:bg-status-pending-muted">
            Ver Pendientes
          </Button>
        </Link>
        <Link href="/shipments">
          <Button variant="outline" className="border-status-in-transit text-status-in-transit hover:bg-status-in-transit-muted">
            Ver Envíos
          </Button>
        </Link>
      </div>
    </div>
  )
}
