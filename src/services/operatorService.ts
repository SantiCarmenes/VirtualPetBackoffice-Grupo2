import { apiClient } from '@/lib/apiClient'
import { mockOperatorRepository } from '@/mocks/operatorsMock'

export interface Operator {
  id: string
  name: string
}

export const operatorService = {
  async getOperators(): Promise<Operator[]> {
    try {
      // TODO: verify endpoint
      return await apiClient<Operator[]>('/operators')
    } catch {
      return mockOperatorRepository.getOperators()
    }
  },
}
