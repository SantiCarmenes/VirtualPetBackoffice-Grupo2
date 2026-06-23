'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle, CheckCircle2, Package, XCircle, FileText, Truck, Info } from 'lucide-react'

import { Order, INVOICE_STATUS_LABELS } from '@/types/order'
import { orderService } from '@/services/orderService'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FulfillmentChecklistProps {
  order: Order
}

export function FulfillmentChecklist({ order }: FulfillmentChecklistProps) {
  const router = useRouter()
  const [packedItemIds, setPackedItemIds] = useState<Set<string>>(new Set())
  const [isUpdating, setIsUpdating] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const totalItems = order.items.length
  const packedCount = packedItemIds.size
  const isFullyPacked = packedCount === totalItems && totalItems > 0

  const toggleItem = (itemId: string) => {
    const next = new Set(packedItemIds)
    if (next.has(itemId)) next.delete(itemId)
    else next.add(itemId)
    setPackedItemIds(next)
  }

  async function updateStatus(status: Order['status'], successMsg: string) {
    setIsUpdating(true)
    try {
      await orderService.updateOrderStatus(order.id, status)
      toast.success(successMsg)
      router.refresh()
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar el estado')
    } finally {
      setIsUpdating(false)
      setShowCancelDialog(false)
    }
  }

  async function handleMarkInvoiced() {
    setIsUpdating(true)
    try {
      await orderService.markAsInvoiced(order.id)
      toast.success('Pedido marcado como facturado')
      router.refresh()
    } catch (error: any) {
      toast.error(error?.message || 'Error al marcar como facturado')
    } finally {
      setIsUpdating(false)
    }
  }

  const isReadOnly = order.status === 'DELIVERED' || order.status === 'CANCELLED'
  const showChecklist = order.status === 'RECEIVED'

  return (
    <div className="space-y-6">
      {/* Progress bar during packing (only RECEIVED) */}
      {showChecklist && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progreso de Preparación</span>
              <span className="text-sm text-muted-foreground">
                {packedCount} / {totalItems} artículos
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${totalItems > 0 ? (packedCount / totalItems) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product list */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
            <CardDescription>
              {showChecklist
                ? 'Marcá cada producto como empacado antes de iniciar la preparación'
                : 'Productos incluidos en este pedido'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${showChecklist ? 'hover:bg-muted/50' : ''
                  }`}
              >
                {showChecklist && (
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={packedItemIds.has(item.id)}
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                )}
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={`item-${item.id}`}
                    className="cursor-pointer font-medium"
                  >
                    {item.productNameSnapshot}
                  </Label>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {item.skuSnapshot && <span>SKU: {item.skuSnapshot}</span>}
                    <span>Cant: {item.quantity}</span>
                    <span>${Number(item.unitPrice).toFixed(2)} c/u</span>
                  </div>
                </div>
                {showChecklist && packedItemIds.has(item.id) && (
                  <CheckCircle2 className="h-5 w-5 text-status-delivered" />
                )}
              </div>
            ))}
            {order.items.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay productos en este pedido.</p>
            )}
          </CardContent>
        </Card>

        {/* Actions panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>
                {order.status === 'RECEIVED' && 'Prepará el pedido y pasalo a preparación'}
                {order.status === 'IN_PREPARATION' && 'Pedido listo, esperando que un rider lo retire'}
                {order.status === 'IN_TRANSIT' && 'El rider tiene el pedido en camino'}
                {order.status === 'NOT_DELIVERED' && 'Pedido con intento de entrega fallido'}
                {isReadOnly && 'Este pedido ya fue procesado'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* RECEIVED → IN_PREPARATION (requires all items packed) */}
              {order.status === 'RECEIVED' && (
                <>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-center gap-2 text-sm">
                      {isFullyPacked ? (
                        <><CheckCircle2 className="h-4 w-4 text-status-delivered" /><span>Todos los artículos empacados</span></>
                      ) : (
                        <><AlertTriangle className="h-4 w-4 text-amber-600" /><span>Faltan {totalItems - packedCount} artículo(s) por empacar</span></>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    disabled={!isFullyPacked || isUpdating}
                    onClick={() => updateStatus('IN_PREPARATION', 'Preparación iniciada')}
                  >
                    {isUpdating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Actualizando...</>
                    ) : (
                      <><Package className="mr-2 h-4 w-4" />Marcar como Preparado</>
                    )}
                  </Button>
                </>
              )}

              {/* IN_PREPARATION — waiting for rider */}
              {order.status === 'IN_PREPARATION' && (
                <>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">Esperando que un rider retire el pedido</span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={isUpdating}
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar Pedido
                  </Button>
                </>
              )}

              {/* IN_TRANSIT — no actions, rider handles delivery */}
              {order.status === 'IN_TRANSIT' && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span className="font-medium">El rider está en camino. La entrega se gestiona desde la app del rider.</span>
                  </div>
                </div>
              )}

              {/* NOT_DELIVERED — only cancel */}
              {order.status === 'NOT_DELIVERED' && (
                <>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">Intentos de entrega: {order.deliveryAttempts} / 3</p>
                    {order.nextDeliveryAt && (
                      <p className="mt-1 text-xs">
                        Próximo intento:{' '}
                        {new Date(order.nextDeliveryAt).toLocaleString()}
                      </p>
                    )}
                    {order.deliveryAttempts >= 3 && (
                      <p className="mt-1 font-semibold text-red-700">
                        Límite de intentos alcanzado — el pedido será cancelado automáticamente.
                      </p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={isUpdating}
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar Pedido
                  </Button>
                </>
              )}

              {isReadOnly && (
                <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                  Este pedido ya fue procesado y no requiere más acciones.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estado</span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${order.invoiceStatus === 'DONE'
                    ? 'bg-status-delivered text-status-delivered-foreground'
                    : order.invoiceStatus === 'REQUIRED'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {INVOICE_STATUS_LABELS[order.invoiceStatus]}
                </span>
              </div>
              {order.invoiceCuit && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">CUIT</span>
                  <span className="font-mono font-medium">{order.invoiceCuit}</span>
                </div>
              )}
              {order.invoiceStatus === 'REQUIRED' && (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={handleMarkInvoiced}
                >
                  {isUpdating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Marcando...</>
                  ) : (
                    <><CheckCircle2 className="mr-2 h-4 w-4" />Marcar como Facturado</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Confirmar Cancelación
            </DialogTitle>
            <DialogDescription>
              Estás a punto de cancelar este pedido. Esta acción liberará el stock reservado y no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={() => updateStatus('CANCELLED', 'Pedido cancelado')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cancelando...</>
              ) : (
                'Confirmar Cancelación'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
