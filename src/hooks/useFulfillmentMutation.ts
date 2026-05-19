'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fulfillmentService } from '@/services/fulfillmentService'
import { ShippingApiStatus } from '@/types/shipment'
import { toast } from 'sonner'

export function useFulfillmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      orderId: string
      status: ShippingApiStatus
      updateOrderStatus?: 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
    }) => fulfillmentService.updateShippingStatus(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      queryClient.invalidateQueries({ queryKey: ['shipping', variables.orderId] })
      toast.success('Estado actualizado correctamente')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al actualizar el estado')
    },
  })
}
