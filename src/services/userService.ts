import { apiClient } from '@/lib/apiClient'
import { User } from '@/types/order'

export const userService = {
  async getUsers(): Promise<User[]> {
    return apiClient<User[]>('/users')
  },
}
