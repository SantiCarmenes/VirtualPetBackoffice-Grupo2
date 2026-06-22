import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { API_BASE_URL } from './lib/config'

const PROTECTED = ['/dashboard', '/orders', '/pending', '/shipments']

const COOKIE_OPTS = (maxAge: number) => ({
  httpOnly: true as const,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge,
  path: '/',
})

async function tryRefresh(refreshToken: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    return res.json() as Promise<{ accessToken: string; refreshToken?: string }>
  } catch {
    return undefined // network error — don't treat as invalid
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isLogin = pathname === '/login'

  const access = request.cookies.get('access_token')?.value
  const refresh = request.cookies.get('refresh_token')?.value

  // Cookie maxAge handles expiry detection — no JWT decoding needed
  if (isProtected && !access && refresh) {
    const tokens = await tryRefresh(refresh)

    if (tokens) {
      const response = NextResponse.next()
      response.cookies.set('access_token', tokens.accessToken, COOKIE_OPTS(60 * 15))
      if (tokens.refreshToken) {
        response.cookies.set('refresh_token', tokens.refreshToken, COOKIE_OPTS(60 * 60 * 24 * 7))
      }
      return response
    }

    if (tokens === null) {
      // Backend explicitly rejected the refresh token
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.set('access_token', '', { httpOnly: true, maxAge: 0, path: '/' })
      response.cookies.set('refresh_token', '', { httpOnly: true, maxAge: 0, path: '/' })
      return response
    }

    // tokens === undefined: network error — let the page render and error boundary handle it
  }

  if (isProtected && !access && !refresh) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isLogin && access) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
