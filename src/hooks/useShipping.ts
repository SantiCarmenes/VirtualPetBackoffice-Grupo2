'use client'

import { useQuery } from '@tanstack/react-query'
import { shippingService } from '@/services/shippingService'

export function useShipping(orderId: string) {
  return useQuery({
    queryKey: ['shipping', orderId],
    queryFn: () => shippingService.getShippingByOrderId(orderId),
    enabled: !!orderId,
    retry: false,
  })
}
