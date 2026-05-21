import { getServerOrderById } from '@/lib/serverData'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '@/components/orders/status-badge'
import { FulfillmentChecklist } from '@/components/orders/fulfillment-checklist'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { OrderStatus } from '@/types/order'

const TIMELINE_STEPS: { label: string; statuses: OrderStatus[] }[] = [
  { label: 'Recibido', statuses: ['RECEIVED', 'IN_PREPARATION', 'IN_TRANSIT', 'NOT_DELIVERED', 'DELIVERED'] },
  { label: 'En Preparación', statuses: ['IN_PREPARATION', 'IN_TRANSIT', 'NOT_DELIVERED', 'DELIVERED'] },
  { label: 'En Camino', statuses: ['IN_TRANSIT', 'NOT_DELIVERED', 'DELIVERED'] },
  { label: 'Entregado', statuses: ['DELIVERED'] },
]

const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  CREDIT_CARD: 'Tarjeta de Crédito',
  DEBIT_CARD: 'Tarjeta de Débito',
  TRANSFER: 'Transferencia',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  REFUNDED: 'Reembolsado',
}

export default async function FulfillPage({ params }: { params: { id: string } }) {
  const order = await getServerOrderById(params.id)

  if (!order) notFound()

  const payment = order.payment

  const isCancelled = order.status === 'CANCELLED'
  const isNotDelivered = order.status === 'NOT_DELIVERED'

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
          <h1 className="text-2xl font-bold">Detalle del Pedido</h1>
          <p className="text-sm text-muted-foreground">
            #{order.id.slice(0, 8).toUpperCase()} — {order.customerName}
          </p>
        </div>
        <StatusBadge status={order.status} />
        {order.deliveryAttempts > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            {order.deliveryAttempts}/3 intentos
          </span>
        )}
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {TIMELINE_STEPS.map((step, i, arr) => {
                const active = step.statuses.includes(order.status)
                const nextActive = i < arr.length - 1 && arr[i + 1].statuses.includes(order.status)
                return (
                  <div key={step.label} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          active
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
                          active && nextActive ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
            {isNotDelivered && order.nextDeliveryAt && (
              <p className="mt-4 text-center text-xs text-amber-700">
                Próximo intento programado: {new Date(order.nextDeliveryAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Customer & payment info */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Nombre</Label>
              <p className="text-sm font-medium">{order.customerName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-sm font-medium">{order.customerEmail}</p>
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
                  <p className="text-sm font-medium">
                    {PAYMENT_LABELS[payment.method] ?? payment.method}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado del Pago</Label>
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
                    {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>${Number(order.shippingCost).toFixed(2)}</span>
            </div>
            {Number(order.discountTotal) > 0 && (
              <div className="flex justify-between text-status-delivered">
                <span>Descuento</span>
                <span>-${Number(order.discountTotal).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1 font-semibold">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)} {order.currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
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
        <FulfillmentChecklist order={order} />
      )}
    </div>
  )
}
