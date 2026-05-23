import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return NextResponse.json(
        { message: error.message || 'Login failed' },
        { status: res.status }
      )
    }

    const data = await res.json()
    const { accessToken, refreshToken, ...rest } = data

    const response = NextResponse.json(rest)

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    })

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
