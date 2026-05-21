import { apiClient } from '@/lib/apiClient'
import { Warehouse } from '@/types/order'

export const warehouseService = {
  async getWarehouses(): Promise<Warehouse[]> {
    return apiClient<Warehouse[]>('/warehouses')
  },
}
