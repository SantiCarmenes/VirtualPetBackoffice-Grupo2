import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('vp_backoffice_token')?.value

  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login'
  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/shipments') ||
    pathname.startsWith('/issues')

  // TODO: activate login - uncomment to enforce authentication
  // if (!token && isProtectedPage) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/shipments', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
