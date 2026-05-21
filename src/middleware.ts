import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { API_BASE_URL } from './lib/config'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login'
  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/shipments') ||
    pathname.startsWith('/pending') ||
    pathname.startsWith('/orders')

  const accessToken = request.cookies.get('vp_access_token')?.value
  const refreshToken = request.cookies.get('vp_refresh_token')?.value

  // If accessing protected route without access token, try refresh
  if (!accessToken && refreshToken && isProtectedPage) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (refreshRes.ok) {
        const data = await refreshRes.json()
        const response = NextResponse.next()

        response.cookies.set('vp_access_token', data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 15,
          path: '/',
        })

        if (data.refreshToken) {
          response.cookies.set('vp_refresh_token', data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          })
        }

        return response
      }
    } catch {
      // Refresh failed, fall through to redirect
    }

    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set('vp_access_token', '', { httpOnly: true, maxAge: 0, path: '/' })
    response.cookies.set('vp_refresh_token', '', { httpOnly: true, maxAge: 0, path: '/' })
    return response
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
