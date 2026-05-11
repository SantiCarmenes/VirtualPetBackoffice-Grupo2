import { apiClient } from '@/lib/apiClient'
import { mockShipmentRepository } from '@/mocks/shipmentMockRepository'
import { Shipment, ShipmentStatus } from '@/types/shipment'

interface GetShipmentsParams {
  status?: ShipmentStatus
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface ShipmentsResponse {
  data: Shipment[]
  total: number
  page: number
  limit: number
}

export const shipmentService = {
  async getShipments(params?: GetShipmentsParams): Promise<ShipmentsResponse> {
    try {
      // TODO: verify endpoint
      return await apiClient<ShipmentsResponse>('/shipments', {
        params: {
          ...(params?.status && { status: params.status }),
          ...(params?.page && { page: params.page }),
          ...(params?.limit && { limit: params.limit }),
          ...(params?.sortBy && { sortBy: params.sortBy }),
          ...(params?.sortOrder && { sortOrder: params.sortOrder }),
        },
      })
    } catch {
      return mockShipmentRepository.getShipments(params)
    }
  },

  async getShipmentById(id: string): Promise<Shipment> {
    try {
      // TODO: verify endpoint
      return await apiClient<Shipment>(`/shipments/${id}`)
    } catch {
      const shipment = mockShipmentRepository.getShipmentById(id)
      if (!shipment) {
        throw new Error('Envío no encontrado')
      }
      return shipment
    }
  },
}
