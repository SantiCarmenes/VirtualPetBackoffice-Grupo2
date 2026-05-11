'use client'

import { useQuery } from '@tanstack/react-query'
import { shipmentService } from '@/services/shipmentService'
import { ShipmentStatus } from '@/types/shipment'

interface UseShipmentsOptions {
  status?: ShipmentStatus
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useShipments(options?: UseShipmentsOptions) {
  return useQuery({
    queryKey: ['shipments', options],
    queryFn: () => shipmentService.getShipments(options),
  })
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: ['shipments', id],
    queryFn: () => shipmentService.getShipmentById(id),
    enabled: !!id,
  })
}
