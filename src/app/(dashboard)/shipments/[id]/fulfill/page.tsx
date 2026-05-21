import { getServerShipmentById } from '@/lib/serverData'
import { serverFetch } from '@/lib/serverApi'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '@/components/shipments/status-badge'
import { FulfillmentChecklist } from '@/components/shipments/fulfillment-checklist'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Payment } from '@/services/paymentService'

export default async function FulfillPage({ params }: { params: { id: string } }) {
  const shipment = await getServerShipmentById(params.id)

  if (!shipment) {
    notFound()
  }

  const payment = await serverFetch<Payment>(`/payment/orders/${params.id}`).catch(() => null)

  const shippingStatus = shipment.shippingStatus
  const isCancelled = shipment.status === 'CANCELLED'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/shipments">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Preparación</h1>
          <p className="text-sm text-muted-foreground">
            Pedido {shipment.orderId} — {shipment.customerName}
          </p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      {/* Shipping Status Timeline */}
      {shippingStatus && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {[
                { label: 'Pendiente', active: true },
                { label: 'En Preparación', active: shippingStatus !== 'PENDING' },
                { label: 'En Tránsito', active: shippingStatus === 'SHIPPED' || shippingStatus === 'DELIVERED' },
                { label: 'Entregado', active: shippingStatus === 'DELIVERED' },
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
              <p className="text-sm font-medium">{shipment.customerEmail}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Nombre</Label>
              <p className="text-sm font-medium">{shipment.customerName}</p>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-muted-foreground">Dirección de Envío</Label>
              <p className="text-sm font-medium">
                {[
                  shipment.shippingAddress.street,
                  shipment.shippingAddress.city,
                  shipment.shippingAddress.province,
                  shipment.shippingAddress.postalCode,
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
      {shipment.shippingId && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Envío</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Estado del Envío</Label>
                <p className="text-sm font-medium">{shippingStatus}</p>
              </div>
              {shipment.shippingEstimatedDelivery && (
                <div>
                  <Label className="text-muted-foreground">Entrega Estimada</Label>
                  <p className="text-sm font-medium">
                    {new Date(shipment.shippingEstimatedDelivery).toLocaleDateString()}
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
        <FulfillmentChecklist shipment={shipment} />
      )}
    </div>
  )
}
