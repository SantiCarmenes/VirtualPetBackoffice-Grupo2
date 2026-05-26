import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { API_BASE_URL } from './lib/config'

function isTokenExpiredOrMissing(token: string | undefined): boolean {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Refresh 30 seconds before actual expiry to avoid race conditions
    return payload.exp * 1000 < Date.now() + 30_000
  } catch {
    return true
  }
}

async function attemptRefresh(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string } | null | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    // Network error — don't treat as invalid token
    return undefined
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login'
  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/shipments') ||
    pathname.startsWith('/pending') ||
    pathname.startsWith('/orders')

  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  const needsRefresh = isProtectedPage && refreshToken && isTokenExpiredOrMissing(accessToken)

  if (needsRefresh) {
    // null = server explicitly rejected the token; undefined = network error
    const data = await attemptRefresh(refreshToken!)

    if (data) {
      // Refresh succeeded — forward request with updated cookies
      const response = NextResponse.next()
      response.cookies.set('access_token', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 15,
        path: '/',
      })
      if (data.refreshToken) {
        response.cookies.set('refresh_token', data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
      }
      return response
    }

    if (data === null) {
      // Backend explicitly rejected — token is invalid, clear and redirect
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.set('access_token', '', { httpOnly: true, maxAge: 0, path: '/' })
      response.cookies.set('refresh_token', '', { httpOnly: true, maxAge: 0, path: '/' })
      return response
    }

    // data === undefined means network error — don't clear cookies, just continue
    // The page will handle it gracefully via error boundaries
  }

  // No tokens at all on protected page
  if (!accessToken && !refreshToken && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated user on login page -> redirect to dashboard
  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
