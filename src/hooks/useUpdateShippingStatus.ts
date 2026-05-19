'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { shippingService } from '@/services/shippingService'
import { toast } from 'sonner'

export function useUpdateShippingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string
      status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'
    }) => shippingService.updateShippingStatus(orderId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipping', variables.orderId] })
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      toast.success('Estado de envío actualizado')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al actualizar el envío')
    },
  })
}
