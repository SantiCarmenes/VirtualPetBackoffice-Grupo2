'use client'

import Link from 'next/link'
import { useShipments } from '@/hooks/useShipments'
import { useIssues } from '@/hooks/useIssues'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Package, Truck, CheckCircle, AlertTriangle } from 'lucide-react'

export default function DashboardPage() {
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments()
  const { data: issuesData, isLoading: issuesLoading } = useIssues()

  const pendingCount = shipmentsData?.data.filter((s) => s.status === 'PENDING').length ?? 0
  const inTransitCount = shipmentsData?.data.filter((s) => s.status === 'IN_TRANSIT').length ?? 0
  const deliveredCount = shipmentsData?.data.filter((s) => s.status === 'DELIVERED').length ?? 0
  const failedCount = shipmentsData?.data.filter((s) => s.status.startsWith('FAILED')).length ?? 0
  const issuesCount = issuesData?.total ?? 0

  const isLoading = shipmentsLoading || issuesLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de Control</h1>
        <p className="text-sm text-muted-foreground">Resumen de tus operaciones de envío</p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/pending">
              <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Package className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                  <p className="text-xs text-muted-foreground">Esperando preparación</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/shipments">
              <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
                  <Truck className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inTransitCount}</div>
                  <p className="text-xs text-muted-foreground">En camino</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/shipments">
              <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Entregados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{deliveredCount}</div>
                  <p className="text-xs text-muted-foreground">Completados</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/shipments">
              <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Intentos Fallidos</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{failedCount}</div>
                  <p className="text-xs text-muted-foreground">Problemas de entrega</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/issues">
              <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Incidencias</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{issuesCount}</div>
                  <p className="text-xs text-muted-foreground">Reembolsos y stock faltante</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Link href="/pending">
              <Button variant="outline">Ver Pendientes</Button>
            </Link>
            <Link href="/shipments">
              <Button variant="outline">Ver Envíos</Button>
            </Link>
            <Link href="/issues">
              <Button variant="outline">Ver Incidencias</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
