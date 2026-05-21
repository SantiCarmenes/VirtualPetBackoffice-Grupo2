import { getServerOrderById, getServerShippingRecord, getServerPayment } from '@/lib/serverData'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '@/components/orders/status-badge'
import { FulfillmentChecklist } from '@/components/orders/fulfillment-checklist'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default async function FulfillPage({ params }: { params: { id: string } }) {
  const [order, shippingRecord, payment] = await Promise.all([
    getServerOrderById(params.id),
    getServerShippingRecord(params.id),
    getServerPayment(params.id),
  ])

  if (!order) {
    notFound()
  }

  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Preparación</h1>
          <p className="text-sm text-muted-foreground">
            Pedido {order.id} — {order.customerName}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Shipping Status Timeline */}
      {shippingRecord && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {[
                { label: 'Pendiente', active: true },
                { label: 'En Preparación', active: shippingRecord.status !== 'PENDING' },
                { label: 'En Tránsito', active: shippingRecord.status === 'SHIPPED' || shippingRecord.status === 'DELIVERED' },
                { label: 'Entregado', active: shippingRecord.status === 'DELIVERED' },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        step.active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs text-muted-foreground">{step.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 ${
                        step.active && arr[i + 1].active ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-sm font-medium">{order.customerEmail}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Nombre</Label>
              <p className="text-sm font-medium">{order.customerName}</p>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-muted-foreground">Dirección de Envío</Label>
              <p className="text-sm font-medium">
                {[
                  order.shippingAddress.street,
                  order.shippingAddress.city,
                  order.shippingAddress.province,
                  order.shippingAddress.postalCode,
                ]
                  .filter(Boolean)
                  .join(', ') || 'No especificada'}
              </p>
            </div>
            {payment && (
              <>
                <div>
                  <Label className="text-muted-foreground">Método de Pago</Label>
                  <p className="text-sm font-medium">{payment.method.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado del Pago</Label>
                  <p className="text-sm font-medium">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        payment.status === 'APPROVED'
                          ? 'bg-status-delivered text-status-delivered-foreground'
                          : payment.status === 'PENDING'
                          ? 'bg-status-pending text-status-pending-foreground'
                          : payment.status === 'REJECTED'
                          ? 'bg-status-cancelled text-status-cancelled-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Info (if exists) */}
      {shippingRecord && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Envío</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Estado del Envío</Label>
                <p className="text-sm font-medium">{shippingRecord.status}</p>
              </div>
              {shippingRecord.estimatedDelivery && (
                <div>
                  <Label className="text-muted-foreground">Entrega Estimada</Label>
                  <p className="text-sm font-medium">
                    {new Date(shippingRecord.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isCancelled ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Este pedido ha sido cancelado.</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <FulfillmentChecklist order={order} shippingRecord={shippingRecord} />
      )}
    </div>
  )
}
