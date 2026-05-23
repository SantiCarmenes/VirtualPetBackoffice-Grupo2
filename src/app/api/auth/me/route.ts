import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/lib/config'

export async function GET() {
  try {
    const cookieStore = cookies()
    let accessToken = cookieStore.get('access_token')?.value
    let newTokens: { accessToken: string; refreshToken?: string } | null = null

    if (!accessToken) {
      const refreshToken = cookieStore.get('refresh_token')?.value
      if (!refreshToken) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
      }

      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!refreshRes.ok) {
        const response = NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
        response.cookies.set('access_token', '', { httpOnly: true, maxAge: 0, path: '/' })
        response.cookies.set('refresh_token', '', { httpOnly: true, maxAge: 0, path: '/' })
        return response
      }

      newTokens = await refreshRes.json()
      accessToken = newTokens!.accessToken
    }

    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const user = await res.json()
    const response = NextResponse.json(user)

    if (newTokens) {
      response.cookies.set('access_token', newTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 15,
        path: '/',
      })
      if (newTokens.refreshToken) {
        response.cookies.set('refresh_token', newTokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
      }
    }

    return response
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
