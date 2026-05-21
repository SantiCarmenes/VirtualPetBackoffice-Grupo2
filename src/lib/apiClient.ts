import { ApiError } from '@/types/shipment'

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`/api/proxy${path}`, window.location.origin)
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
let refreshPromise: Promise<void> | null = null

async function performRefresh(): Promise<void> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Refresh failed')
  }
}

function getRefreshOperation(): Promise<void> {
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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((restConfig.headers as Record<string, string>) || {}),
  }

  const response = await fetch(url, {
    ...restConfig,
    headers,
  })

  if (response.status === 401) {
    try {
      await getRefreshOperation()

      const retryResponse = await fetch(url, {
        ...restConfig,
        headers,
      })

      return handleResponse<T>(retryResponse)
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Unauthorized')
    }
  }

  return handleResponse<T>(response)
}
