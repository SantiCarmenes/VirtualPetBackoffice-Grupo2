import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('vp_access_token')?.value
  const refreshToken = request.cookies.get('vp_refresh_token')?.value

  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login'
  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/shipments') ||
    pathname.startsWith('/pending')

  const hasToken = !!accessToken || !!refreshToken

  if (!hasToken && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasToken && isAuthPage) {
   return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
