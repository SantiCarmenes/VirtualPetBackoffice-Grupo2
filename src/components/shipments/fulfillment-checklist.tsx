'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'

import { Shipment, Product, LogisticsType, LOGISTICS_LABELS } from '@/types/shipment'
import { useOperators } from '@/hooks/useOperators'
import { useFulfillmentMutation } from '@/hooks/useFulfillmentMutation'
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
import { StatusBadge } from './status-badge'

const LOGISTICS_OPTIONS: { value: LogisticsType; label: string }[] = [
  { value: 'INTERNAL_DELIVERY', label: LOGISTICS_LABELS['INTERNAL_DELIVERY'] },
  { value: 'COURIER_1', label: LOGISTICS_LABELS['COURIER_1'] },
  { value: 'COURIER_2', label: LOGISTICS_LABELS['COURIER_2'] },
]

interface FulfillmentChecklistProps {
  shipment: Shipment
}

export function FulfillmentChecklist({ shipment }: FulfillmentChecklistProps) {
  const router = useRouter()
  const { data: operators, isLoading: operatorsLoading } = useOperators()
  const { mutate: submitFulfillment, isPending: isSubmitting } = useFulfillmentMutation()

  const [packedProductIds, setPackedProductIds] = useState<Set<string>>(
    new Set(shipment.products.filter((p) => p.packed).map((p) => p.id))
  )
  const [operatorName, setOperatorName] = useState(shipment.operatorName || '')
  const [logisticsType, setLogisticsType] = useState<LogisticsType | ''>(
    shipment.logisticsType || ''
  )
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false)

  const totalProducts = shipment.products.length
  const packedCount = packedProductIds.size
  const isFullyPacked = packedCount === totalProducts && totalProducts > 0
  const hasDiscrepancy = packedCount < totalProducts

  const toggleProduct = (productId: string) => {
    const next = new Set(packedProductIds)
    if (next.has(productId)) {
      next.delete(productId)
    } else {
      next.add(productId)
    }
    setPackedProductIds(next)
  }

  const handleSubmit = () => {
    if (!operatorName || !logisticsType) return

    if (hasDiscrepancy) {
      setShowDiscrepancyDialog(true)
      return
    }

    doSubmit(false)
  }

  const doSubmit = (discrepancy: boolean) => {
    submitFulfillment(
      {
        shipmentId: shipment.id,
        operatorName,
        logisticsType: logisticsType as LogisticsType,
        packedProductIds: Array.from(packedProductIds),
        discrepancy,
      },
      {
        onSuccess: () => {
          setShowDiscrepancyDialog(false)
          router.push('/shipments')
        },
      }
    )
  }

  const canSubmit = operatorName && logisticsType && !isSubmitting

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

      {/* Progress */}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
            <CardDescription>Marca cada producto como empacado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {shipment.products.map((product: Product) => (
              <div
                key={product.id}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  id={`product-${product.id}`}
                  checked={packedProductIds.has(product.id)}
                  onCheckedChange={() => toggleProduct(product.id)}
                />
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

        {/* Metadata & Submit */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Preparación</CardTitle>
            <CardDescription>Registra quién preparó el envío y cómo se envía</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Operator */}
            <div className="space-y-2">
              <Label htmlFor="operator">Operario</Label>
              {operatorsLoading ? (
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
                    {operators?.map((op) => (
                      <SelectItem key={op.id} value={op.name}>
                        {op.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Logistics Type */}
            <div className="space-y-2">
              <Label htmlFor="logistics">Tipo de Logística</Label>
              <Select
                value={logisticsType}
                onValueChange={(v) => setLogisticsType(v as LogisticsType)}
              >
                <SelectTrigger id="logistics">
                  <SelectValue placeholder="Seleccionar tipo de logística" />
                </SelectTrigger>
                <SelectContent>
                  {LOGISTICS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm">
                {isFullyPacked ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Todos los {totalProducts} artículos preparados — listo para envío</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>
                      Faltan {totalProducts - packedCount} artículo(s) — se requiere bandera de discrepancia
                    </span>
                  </>
                )}
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : isFullyPacked ? (
                'Enviar y Marcar En Tránsito'
              ) : (
                'Enviar con Discrepancia'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Discrepancy Confirmation Dialog */}
      <Dialog open={showDiscrepancyDialog} onOpenChange={setShowDiscrepancyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Confirmar Envío con Discrepancia
            </DialogTitle>
            <DialogDescription>
              Estás a punto de enviar una preparación con artículos faltantes. Se levantará una bandera de discrepancia y se generará automáticamente un <strong>Reporte para el Cliente</strong>.
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operario</span>
              <span className="font-medium">{operatorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Logística</span>
              <span className="font-medium">
                {LOGISTICS_OPTIONS.find((o) => o.value === logisticsType)?.label}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDiscrepancyDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => doSubmit(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Confirmar y Generar Reporte'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
