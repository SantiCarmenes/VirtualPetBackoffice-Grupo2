import { apiClient } from '@/lib/apiClient'

export interface BackofficeUser {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  role: 'USER' | 'BACKOFFICE'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const userService = {
  async getUsers(): Promise<BackofficeUser[]> {
    return apiClient<BackofficeUser[]>('/users')
  },
}
