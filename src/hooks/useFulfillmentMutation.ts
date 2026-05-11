'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fulfillmentService } from '@/services/fulfillmentService'
import { FulfillmentPayload } from '@/types/shipment'
import { toast } from 'sonner'

export function useFulfillmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: FulfillmentPayload) => fulfillmentService.submitFulfillment(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      toast.success(
        data.status === 'IN_TRANSIT'
          ? 'Envío marcado como en tránsito correctamente'
          : 'Preparación enviada con bandera de discrepancia'
      )
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al enviar la preparación')
    },
  })
}
