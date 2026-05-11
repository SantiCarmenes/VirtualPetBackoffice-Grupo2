import { apiClient } from '@/lib/apiClient'
import { MOCK_ADMIN_TOKEN } from '@/lib/auth'
import { AuthCredentials, AuthTokens } from '@/types/shipment'

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthTokens> {
    // Dev fallback: admin/admin bypasses real API
    if (credentials.email === 'admin@example.com' && credentials.password === 'admin') {
      return { accessToken: MOCK_ADMIN_TOKEN }
    }

    // TODO: verify endpoint
    return apiClient<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  async logout(): Promise<void> {
    // TODO: verify endpoint
    return apiClient<void>('/auth/logout', {
      method: 'POST',
    })
  },

  async me(): Promise<{ id: string; email: string; name: string }> {
    // TODO: activate login - remove this mock bypass, uncomment the real API call
    const token = typeof window !== 'undefined' ? localStorage.getItem('vp_backoffice_token') : null
    if (!token || token === MOCK_ADMIN_TOKEN) {
      return { id: 'admin', email: 'admin@example.com', name: 'Admin User' }
    }

    // TODO: verify endpoint
    return apiClient<{ id: string; email: string; name: string }>('/auth/me')
  },
}
