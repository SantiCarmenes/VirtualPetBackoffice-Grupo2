'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, AlertTriangle, CheckCircle2, Package, Truck } from 'lucide-react'

import { Shipment, Product } from '@/types/shipment'
import { useFulfillmentMutation } from '@/hooks/useFulfillmentMutation'
import { useCreateShippingRecord } from '@/hooks/useCreateShippingRecord'
import { useShippingMethods } from '@/hooks/useShippingMethods'
import { useShipping } from '@/hooks/useShipping'
import { usePayment } from '@/hooks/usePayment'
import { useUsers } from '@/hooks/useUsers'
import { useWarehouses } from '@/hooks/useWarehouses'
import { stockService } from '@/services/stockService'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from './status-badge'
import { toast } from 'sonner'

interface FulfillmentChecklistProps {
  shipment: Shipment
}

export function FulfillmentChecklist({ shipment }: FulfillmentChecklistProps) {
  const router = useRouter()
  const { data: shippingRecord } = useShipping(shipment.id)
  const { data: shippingMethods, isLoading: methodsLoading } = useShippingMethods()
  const { data: payment } = usePayment(shipment.id)
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: warehouses, isLoading: warehousesLoading } = useWarehouses()
  const { mutate: createShipping, isPending: isCreating } = useCreateShippingRecord()
  const { mutate: updateStatus, isPending: isUpdating } = useFulfillmentMutation()

  const [packedProductIds, setPackedProductIds] = useState<Set<string>>(
    new Set(shipment.products.filter((p) => p.packed).map((p) => p.id))
  )
  const [operatorName, setOperatorName] = useState('')
  const [shippingMethodId, setShippingMethodId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false)

  const totalProducts = shipment.products.length
  const packedCount = packedProductIds.size
  const isFullyPacked = packedCount === totalProducts && totalProducts > 0
  const hasDiscrepancy = packedCount < totalProducts

  const selectedMethod = shippingMethods?.find((m) => m.id === shippingMethodId)
  const selectedWarehouse = warehouses?.find((w) => w.id === warehouseId)
  const backofficeUsers = users?.filter((u) => u.role === 'BACKOFFICE') ?? []

  const toggleProduct = (productId: string) => {
    const next = new Set(packedProductIds)
    if (next.has(productId)) {
      next.delete(productId)
    } else {
      next.add(productId)
    }
    setPackedProductIds(next)
  }

  // Step 1: Create shipping record
  const handleStartPreparation = () => {
    if (!shippingMethodId || !operatorName) return
    const estimatedDelivery = selectedMethod
      ? new Date(Date.now() + selectedMethod.estimatedDays * 86400000).toISOString()
      : undefined

    createShipping(
      {
        orderId: shipment.id,
        methodId: shippingMethodId,
        estimatedDelivery,
      },
      {
        onSuccess: () => {
          setShippingMethodId('')
        },
      }
    )
  }

  // Step 2: Deduct stock and mark packing complete → PROCESSING
  const handleCompletePacking = async () => {
    if (!shippingRecord || !warehouseId) return

    try {
      // Deduct stock for each product
      await Promise.all(
        shipment.products.map(async (product) => {
          const stockRecords = await stockService.getStockByVariant(product.id)
          const warehouseStock = stockRecords.find((s) => s.warehouseId === warehouseId)
          const currentQty = warehouseStock?.quantityAvailable ?? 0
          const newQty = Math.max(0, currentQty - product.quantity)

          await stockService.updateStock({
            variantId: product.id,
            warehouseId,
            quantityAvailable: newQty,
          })
        })
      )

      updateStatus({
        orderId: shipment.id,
        status: 'PROCESSING',
      })
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar stock')
    }
  }

  // Step 3: Hand to courier → SHIPPED
  const handleHandToCourier = () => {
    if (!shippingRecord) return
    updateStatus(
      {
        orderId: shipment.id,
        status: 'SHIPPED',
        updateOrderStatus: 'SHIPPED',
      },
      {
        onSuccess: () => {
          router.push('/shipments')
        },
      }
    )
  }

  // Discrepancy: Cancel order
  const handleDiscrepancySubmit = () => {
    updateStatus(
      {
        orderId: shipment.id,
        status: 'SHIPPED',
        updateOrderStatus: 'CANCELLED',
      },
      {
        onSuccess: () => {
          setShowDiscrepancyDialog(false)
          router.push('/issues')
        },
      }
    )
  }

  const isLoading = isCreating || isUpdating

  // Determine current stage
  const shippingStatus = shippingRecord?.status
  const isReadOnly = shippingStatus === 'SHIPPED' || shippingStatus === 'DELIVERED'
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

      {/* Progress */}
      {!isReadOnly && !isCancelled && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progreso de Preparación</span>
              <span className="text-sm text-muted-foreground">
                {packedCount} / {totalProducts} artículos
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${totalProducts > 0 ? (packedCount / totalProducts) * 100 : 0}%` }}
              />
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
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : payment.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
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
              {shipment.products.map((product: Product) => (
                <div
                  key={product.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                    isReadOnly ? '' : 'hover:bg-muted/50'
                  }`}
                >
                  {!isReadOnly && (
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={packedProductIds.has(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={`product-${product.id}`}
                      className="cursor-pointer font-medium"
                    >
                      {product.name}
                    </Label>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>SKU: {product.sku}</span>
                      <span>Cant: {product.quantity}</span>
                    </div>
                  </div>
                  {packedProductIds.has(product.id) && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                </div>
              ))}
              {shipment.products.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay productos en este envío.</p>
              )}
            </CardContent>
          </Card>

          {/* Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>
                {!shippingStatus
                  ? 'Inicia la preparación seleccionando operario, depósito y método de envío'
                  : shippingStatus === 'PENDING'
                  ? 'Completa el empaque de todos los artículos'
                  : shippingStatus === 'PROCESSING'
                  ? 'Entrega el paquete a la mensajería'
                  : 'Este envío ya fue procesado'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Select operator, warehouse, shipping method, and start */}
              {!shippingStatus && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="operator">Operario</Label>
                    {usersLoading ? (
                      <div className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando operarios...
                      </div>
                    ) : (
                      <Select value={operatorName} onValueChange={setOperatorName}>
                        <SelectTrigger id="operator">
                          <SelectValue placeholder="Seleccionar operario" />
                        </SelectTrigger>
                        <SelectContent>
                          {backofficeUsers.map((user) => (
                            <SelectItem key={user.id} value={`${user.firstName} ${user.lastName}`}>
                              {user.firstName} {user.lastName} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouse">Depósito de Origen</Label>
                    {warehousesLoading ? (
                      <div className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando depósitos...
                      </div>
                    ) : (
                      <Select value={warehouseId} onValueChange={setWarehouseId}>
                        <SelectTrigger id="warehouse">
                          <SelectValue placeholder="Seleccionar depósito" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses?.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name} ({warehouse.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logistics">Método de Envío</Label>
                    {methodsLoading ? (
                      <div className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando métodos...
                      </div>
                    ) : (
                      <Select
                        value={shippingMethodId}
                        onValueChange={setShippingMethodId}
                      >
                        <SelectTrigger id="logistics">
                          <SelectValue placeholder="Seleccionar método de envío" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingMethods?.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name} — ${method.cost} ({method.estimatedDays} días)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    disabled={!shippingMethodId || !operatorName || !warehouseId || isLoading}
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

              {/* Step 2: Complete packing → PROCESSING */}
              {shippingStatus === 'PENDING' && (
                <>

                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-center gap-2 text-sm">
                      {isFullyPacked ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Todos los artículos preparados</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span>Faltan {totalProducts - packedCount} artículo(s)</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    disabled={!isFullyPacked || !warehouseId || isLoading}
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
                        Completar Empaque y Descontar Stock
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

              {/* Step 3: Hand to courier → SHIPPED */}
              {shippingStatus === 'PROCESSING' && (
                <Button
                  className="w-full"
                  disabled={isLoading}
                  onClick={handleHandToCourier}
                >
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
      )}

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
                {packedCount} / {totalProducts}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Artículos Faltantes</span>
              <span className="font-medium text-destructive">
                {totalProducts - packedCount}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDiscrepancyDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDiscrepancySubmit}
              disabled={isLoading}
            >
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
