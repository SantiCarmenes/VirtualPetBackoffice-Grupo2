'use client'

import { useQuery } from '@tanstack/react-query'
import { shippingService } from '@/services/shippingService'

export function useShippingMethods() {
  return useQuery({
    queryKey: ['shipping', 'methods'],
    queryFn: () => shippingService.getMethods(),
  })
}
