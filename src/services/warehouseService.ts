import { apiClient } from '@/lib/apiClient'

export interface Warehouse {
  id: string
  name: string
  code: string
  address: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export const warehouseService = {
  async getWarehouses(): Promise<Warehouse[]> {
    return apiClient<Warehouse[]>('/warehouses')
  },
}
