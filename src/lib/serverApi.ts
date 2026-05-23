import { cookies } from 'next/headers'
import { API_BASE_URL } from './config'
import { redirect } from 'next/navigation'

export async function serverFetch<T>(
  path: string,
  config: RequestInit = {}
): Promise<T> {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('access_token')?.value

  const url = `${API_BASE_URL}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers as Record<string, string> || {}),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let response = await fetch(url, { ...config, headers })

  // Access token expired mid-render: try refresh once, then retry
  if (response.status === 401) {
    const refreshToken = cookieStore.get('refresh_token')?.value
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (refreshRes.ok) {
        const { accessToken: newToken } = await refreshRes.json()
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
    throw new Error(errorData.message || `Error HTTP: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as T
}
