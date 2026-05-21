'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle, CheckCircle2, Package, Truck } from 'lucide-react'

import { Order, ShippingRecord, ShippingMethod } from '@/types/order'
import { shippingService } from '@/services/shippingService'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface FulfillmentChecklistProps {
  order: Order
  shippingRecord: ShippingRecord | null
}

export function FulfillmentChecklist({ order, shippingRecord: initialShippingRecord }: FulfillmentChecklistProps) {
  const router = useRouter()

  const [shippingRecord, setShippingRecord] = useState<ShippingRecord | null>(initialShippingRecord)
  const [packedItemIds, setPackedItemIds] = useState<Set<string>>(
    new Set()
  )
  const [shippingMethodId, setShippingMethodId] = useState('')
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const totalItems = order.items.length
  const packedCount = packedItemIds.size
  const isFullyPacked = packedCount === totalItems && totalItems > 0

  const toggleItem = (itemId: string) => {
    const next = new Set(packedItemIds)
    if (next.has(itemId)) {
      next.delete(itemId)
    } else {
      next.add(itemId)
    }
    setPackedItemIds(next)
  }

  // Step 1: Create shipping record
  const handleStartPreparation = async () => {
    if (!shippingMethodId) return
    setIsCreating(true)
    try {
      const record = await shippingService.createShipping({
        orderId: order.id,
        methodId: shippingMethodId,
      })
      setShippingRecord(record)
      toast.success('Preparación iniciada')
    } catch (error: any) {
      toast.error(error?.message || 'Error al iniciar la preparación')
    } finally {
      setIsCreating(false)
    }
  }

  // Step 2: Mark packing complete → update order status to CONFIRMED
  const handleCompletePacking = async () => {
    if (!shippingRecord) return
    setIsUpdating(true)
    try {
      await orderService.updateOrderStatus(order.id, 'CONFIRMED')
      toast.success('Empaque completado')
      window.location.reload()
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar el estado')
    } finally {
      setIsUpdating(false)
    }
  }

  // Step 3: Hand to courier → SHIPPED
  const handleHandToCourier = async () => {
    if (!shippingRecord) return
    setIsUpdating(true)
    try {
      await Promise.all([
        shippingService.updateShippingStatus(order.id, 'SHIPPED'),
        orderService.updateOrderStatus(order.id, 'SHIPPED'),
      ])
      toast.success('Pedido enviado')
      router.push('/orders')
    } catch (error: any) {
      toast.error(error?.message || 'Error al enviar el pedido')
    } finally {
      setIsUpdating(false)
    }
  }

  // Discrepancy: Cancel order
  const handleDiscrepancySubmit = async () => {
    setIsUpdating(true)
    try {
      await orderService.updateOrderStatus(order.id, 'CANCELLED')
      toast.success('Pedido cancelado')
      setShowDiscrepancyDialog(false)
      router.push('/orders')
    } catch (error: any) {
      toast.error(error?.message || 'Error al cancelar el pedido')
    } finally {
      setIsUpdating(false)
    }
  }

  const isLoading = isCreating || isUpdating

  const shippingStatus = shippingRecord?.status
  const isReadOnly = shippingStatus === 'SHIPPED' || shippingStatus === 'DELIVERED' || order.status === 'DELIVERED'

  return (
    <div className="space-y-6">
      {/* Progress */}
      {!isReadOnly && (
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
        {/* Product Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
            <CardDescription>
              {isReadOnly
                ? 'Productos incluidos en este envío'
                : 'Marca cada producto como empacado'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  isReadOnly ? '' : 'hover:bg-muted/50'
                }`}
              >
                {!isReadOnly && (
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
                    <span>Variante: {item.variantId.slice(0, 8).toUpperCase()}</span>
                    <span>Cant: {item.quantity}</span>
                  </div>
                </div>
                {packedItemIds.has(item.id) && (
                  <CheckCircle2 className="h-5 w-5 text-status-delivered" />
                )}
              </div>
            ))}
            {order.items.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay productos en este pedido.</p>
            )}
          </CardContent>
        </Card>

        {/* Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
            <CardDescription>
              {!shippingRecord
                ? 'Inicia la preparación seleccionando un método de envío'
                : shippingRecord.status === 'PENDING'
                ? 'Completa el empaque de todos los artículos'
                : shippingRecord.status === 'PROCESSING'
                ? 'Entrega el paquete a la mensajería'
                : 'Este envío ya fue procesado'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Select shipping method and start */}
            {!shippingRecord && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="logistics">Método de Envío</Label>
                  <Select value={shippingMethodId} onValueChange={setShippingMethodId}>
                    <SelectTrigger id="logistics">
                      <SelectValue placeholder="Seleccionar método de envío" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* In a real scenario, we'd fetch methods server-side and pass them as props */}
                      <SelectItem value="standard">Estándar</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  disabled={!shippingMethodId || isLoading}
                  onClick={handleStartPreparation}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Iniciar Preparación
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Step 2: Complete packing */}
            {shippingRecord?.status === 'PENDING' && (
              <>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    {isFullyPacked ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-status-delivered" />
                        <span>Todos los artículos preparados</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span>Faltan {totalItems - packedCount} artículo(s)</span>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={!isFullyPacked || isLoading}
                  onClick={handleCompletePacking}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Completar Empaque
                    </>
                  )}
                </Button>

                {!isFullyPacked && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={isLoading}
                    onClick={() => setShowDiscrepancyDialog(true)}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Reportar Discrepancia
                  </Button>
                )}
              </>
            )}

            {/* Step 3: Hand to courier */}
            {shippingRecord?.status === 'PROCESSING' && (
              <Button className="w-full" disabled={isLoading} onClick={handleHandToCourier}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-4 w-4" />
                    Entregar a Mensajería
                  </>
                )}
              </Button>
            )}

            {/* Read only states */}
            {isReadOnly && (
              <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                Este envío ya fue procesado y no requiere más acciones.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discrepancy Confirmation Dialog */}
      <Dialog open={showDiscrepancyDialog} onOpenChange={setShowDiscrepancyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Confirmar Discrepancia
            </DialogTitle>
            <DialogDescription>
              Estás a punto de cancelar este pedido debido a artículos faltantes. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-lg border bg-muted/50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Artículos Preparados</span>
              <span className="font-medium">
                {packedCount} / {totalItems}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Artículos Faltantes</span>
              <span className="font-medium text-destructive">
                {totalItems - packedCount}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDiscrepancyDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDiscrepancySubmit} disabled={isLoading}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
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
