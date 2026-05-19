'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fulfillmentService } from '@/services/fulfillmentService'
import { toast } from 'sonner'

export function useCreateShippingRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fulfillmentService.createShippingRecord,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      queryClient.invalidateQueries({ queryKey: ['shipping', variables.orderId] })
      toast.success('Preparación iniciada')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al iniciar la preparación')
    },
  })
}
