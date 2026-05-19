import { getToken, getRefreshToken, setToken, setRefreshToken, removeAllTokens } from './auth'
import { ApiError } from '@/types/shipment'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(path, API_BASE_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error: ApiError = {
      message: errorData.message || `Error HTTP: ${response.status}`,
      code: errorData.code,
      status: response.status,
    }
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

// Silent refresh logic
let refreshPromise: Promise<string> | null = null

async function performRefresh(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token')
  }

  const response = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Refresh failed')
  }

  const data = await response.json()
  setToken(data.accessToken)
  if (data.refreshToken) {
    setRefreshToken(data.refreshToken)
  }
  return data.accessToken
}

function getRefreshedToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export async function apiClient<T>(
  path: string,
  config: RequestConfig = {}
): Promise<T> {
  const { params, ...restConfig } = config
  const url = buildUrl(path, params)

  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((restConfig.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...restConfig,
    headers,
  })

  if (response.status === 401) {
    try {
      const newToken = await getRefreshedToken()

      const retryResponse = await fetch(url, {
        ...restConfig,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
      })

      return handleResponse<T>(retryResponse)
    } catch {
      removeAllTokens()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Unauthorized')
    }
  }

  return handleResponse<T>(response)
}
