import { AuthCredentials, User } from '@/types/shipment'

export const authService = {
  async login(credentials: AuthCredentials): Promise<void> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message || 'Login failed')
    }

    await res.json()
  },

  async logout(): Promise<void> {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message || 'Logout failed')
    }
  },

  async me(): Promise<User> {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message || 'Not authenticated')
    }

    return res.json()
  },
}
