import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/lib/config'

export async function POST() {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('vp_refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json({ message: 'No refresh token' }, { status: 401 })
    }

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) {
      const response = NextResponse.json({ message: 'Refresh failed' }, { status: 401 })
      response.cookies.set('vp_access_token', '', { httpOnly: true, maxAge: 0, path: '/' })
      response.cookies.set('vp_refresh_token', '', { httpOnly: true, maxAge: 0, path: '/' })
      return response
    }

    const data = await res.json()

    const response = NextResponse.json({ accessToken: data.accessToken })

    response.cookies.set('vp_access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    })

    if (data.refreshToken) {
      response.cookies.set('vp_refresh_token', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    }

    return response
  } catch {
    return NextResponse.json({ message: 'Refresh failed' }, { status: 500 })
  }
}
