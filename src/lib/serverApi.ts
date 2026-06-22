import { cookies } from 'next/headers'
import { API_BASE_URL } from './config'
import { redirect } from 'next/navigation'

export async function serverFetch<T>(path: string, config: RequestInit = {}): Promise<T> {
  const cookieStore = cookies()
  const url = `${API_BASE_URL}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers as Record<string, string> || {}),
  }

  const accessToken = cookieStore.get('access_token')?.value
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  let response = await fetch(url, { ...config, headers })

  // If 401, attempt one silent refresh and retry before giving up
  if (response.status === 401) {
    const refreshToken = cookieStore.get('refresh_token')?.value
    if (refreshToken) {
      const refreshed = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => null)

      if (refreshed?.ok) {
        const { accessToken: newToken } = await refreshed.json()
        headers['Authorization'] = `Bearer ${newToken}`
        response = await fetch(url, { ...config, headers })
      }
    }
  }

  if (response.status === 401) {
    redirect('/login')
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const err = new Error(errorData.message || `Error HTTP: ${response.status}`) as Error & { status: number }
    err.status = response.status
    throw err
  }

  if (response.status === 204) return undefined as T

  return response.json() as T
}
