import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/lib/config'

export async function GET() {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('vp_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const user = await res.json()
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
