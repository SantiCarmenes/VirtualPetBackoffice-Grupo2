import { apiClient } from '@/lib/apiClient'

export interface StockRecord {
  id: string
  variantId: string
  warehouseId: string
  quantityAvailable: number
  warehouse?: {
    id: string
    name: string
    code: string
    address: Record<string, unknown>
  }
  createdAt: string
  updatedAt: string
}

export const stockService = {
  async getStockByVariant(variantId: string): Promise<StockRecord[]> {
    return apiClient<StockRecord[]>(`/stock/variants/${variantId}`)
  },

  async updateStock(payload: {
    variantId: string
    warehouseId: string
    quantityAvailable: number
  }): Promise<StockRecord> {
    return apiClient<StockRecord>('/stock', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
