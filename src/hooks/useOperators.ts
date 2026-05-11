'use client'

import { useQuery } from '@tanstack/react-query'
import { operatorService } from '@/services/operatorService'

export function useOperators() {
  return useQuery({
    queryKey: ['operators'],
    queryFn: () => operatorService.getOperators(),
  })
}
