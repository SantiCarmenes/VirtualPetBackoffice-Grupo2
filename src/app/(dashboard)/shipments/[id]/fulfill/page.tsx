'use client'

import { useParams } from 'next/navigation'
import { useShipment } from '@/hooks/useShipments'
import { FulfillmentChecklist } from '@/components/shipments/fulfillment-checklist'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function FulfillPage() {
  const params = useParams()
  const id = params.id as string
  const { data: shipment, isLoading } = useShipment(id)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="space-y-4">
        <Link href="/shipments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Envíos
          </Button>
        </Link>
        <p className="text-muted-foreground">Envío no encontrado.</p>
      </div>
    )
  }

  return <FulfillmentChecklist shipment={shipment} />
}
