'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stockService } from '@/services/stockService'
import { toast } from 'sonner'

export function useStock(variantId: string) {
  return useQuery({
    queryKey: ['stock', variantId],
    queryFn: () => stockService.getStockByVariant(variantId),
    enabled: !!variantId,
  })
}

export function useUpdateStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: stockService.updateStock,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock', variables.variantId] })
      toast.success('Stock actualizado')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al actualizar stock')
    },
  })
}
