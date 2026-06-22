'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle, CheckCircle2, Package } from 'lucide-react'

import { Order } from '@/types/order'
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

interface FulfillmentChecklistProps {
  order: Order
}

export function FulfillmentChecklist({ order }: FulfillmentChecklistProps) {
  const router = useRouter()
  const [packedItemIds, setPackedItemIds] = useState<Set<string>>(new Set())
  const [isUpdating, setIsUpdating] = useState(false)

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
    }
  }

  const isReadOnly = order.status === 'DELIVERED' || order.status === 'CANCELLED'
  const showChecklist = order.status === 'IN_PREPARATION'

  return (
    <div className="space-y-6">
      {/* Progress bar during packing */}
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
                ? 'Marcá cada producto como empacado antes de enviar'
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
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
            <CardDescription>
              {order.status === 'RECEIVED' && 'Iniciá la preparación del pedido'}
              {order.status === 'IN_PREPARATION' && 'Completá el empaque; el repartidor se encargará del envío'}
              {order.status === 'IN_TRANSIT' && 'El pedido está en camino con el repartidor'}
              {order.status === 'NOT_DELIVERED' && 'Pedido con intento de entrega fallido'}
              {isReadOnly && 'Este pedido ya fue procesado'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* RECEIVED → IN_PREPARATION */}
            {order.status === 'RECEIVED' && (
              <Button
                className="w-full"
                disabled={isUpdating}
                onClick={() => updateStatus('IN_PREPARATION', 'Preparación iniciada')}
              >
                {isUpdating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Actualizando...</>
                ) : (
                  <><Package className="mr-2 h-4 w-4" />Iniciar Preparación</>
                )}
              </Button>
            )}

            {/* IN_PREPARATION → packing only */}
            {order.status === 'IN_PREPARATION' && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  {isFullyPacked ? (
                    <><CheckCircle2 className="h-4 w-4 text-status-delivered" /><span>Todos los artículos empacados</span></>
                  ) : (
                    <><AlertTriangle className="h-4 w-4 text-amber-600" /><span>Faltan {totalItems - packedCount} artículo(s)</span></>
                  )}
                </div>
              </div>
            )}

            {/* IN_TRANSIT → rider-owned */}
            {order.status === 'IN_TRANSIT' && (
              <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                El estado de este pedido será actualizado por el repartidor.
              </div>
            )}

            {/* NOT_DELIVERED → rider-owned */}
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
                <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                  Reintento y cancelación automáticos mediante los intentos de entrega.
                </div>
              </>
            )}

            {isReadOnly && (
              <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                Este pedido ya fue procesado y no requiere más acciones.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
