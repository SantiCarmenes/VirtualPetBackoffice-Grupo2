'use client'

import { useQuery } from '@tanstack/react-query'
import { shipmentService } from '@/services/shipmentService'
import { ISSUE_STATUSES } from '@/types/shipment'

export function useIssues(page?: number, limit?: number) {
  return useQuery({
    queryKey: ['issues', page, limit],
    queryFn: async () => {
      const results = await Promise.all(
        ISSUE_STATUSES.map((status) =>
          shipmentService.getShipments({ status, page, limit })
        )
      )
      return {
        data: results.flatMap((r) => r.data),
        total: results.reduce((acc, r) => acc + r.total, 0),
        page: page || 1,
        limit: limit || 10,
      }
    },
  })
}
