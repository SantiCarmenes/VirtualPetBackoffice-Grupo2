'use client'

import { useQuery } from '@tanstack/react-query'
import { paymentService } from '@/services/paymentService'

export function usePayment(orderId: string) {
  return useQuery({
    queryKey: ['payment', orderId],
    queryFn: () => paymentService.getPaymentByOrderId(orderId),
    enabled: !!orderId,
  })
}
