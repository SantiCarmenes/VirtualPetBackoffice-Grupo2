'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { shippingService } from '@/services/shippingService'
import { toast } from 'sonner'

export function useCreateShipping() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: shippingService.createShipping,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipping', variables.orderId] })
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      toast.success('Envío creado correctamente')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al crear el envío')
    },
  })
}
