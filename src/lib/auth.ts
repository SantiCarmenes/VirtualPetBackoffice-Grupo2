const TOKEN_KEY = 'vp_backoffice_token'
export const MOCK_ADMIN_TOKEN = 'mock_admin_token_dev_only'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, maxAge = 604800): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  setCookie(TOKEN_KEY, token)
}

export function removeToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  deleteCookie(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function isMockAdminToken(): boolean {
  return getToken() === MOCK_ADMIN_TOKEN
}
