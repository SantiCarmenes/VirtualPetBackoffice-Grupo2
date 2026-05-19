import { apiClient } from '@/lib/apiClient'
import { getRefreshToken } from '@/lib/auth'
import { AuthCredentials, AuthTokens, User } from '@/types/shipment'

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthTokens> {
    return apiClient<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken()

    return apiClient<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  },

  async me(): Promise<User> {
    return apiClient<User>('/users/me')
  },
}
