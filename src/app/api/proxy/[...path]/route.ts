import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/lib/config'

async function proxyRequest(
  request: Request,
  params: { path: string[] },
  method: string
) {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('vp_access_token')?.value
  const path = params.path.join('/')

  const url = new URL(request.url)
  const searchParams = url.searchParams.toString()
  const targetUrl = `${API_BASE_URL}/${path}${searchParams ? '?' + searchParams : ''}`

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  }

  if (method !== 'GET' && method !== 'HEAD') {
    const body = await request.text()
    if (body) init.body = body
  }

  const res = await fetch(targetUrl, init)

  const responseBody = await res.text()
  return new NextResponse(responseBody, {
    status: res.status,
    statusText: res.statusText,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/json',
    },
  })
}

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params, 'GET')
}

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params, 'POST')
}

export async function PATCH(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params, 'PATCH')
}

export async function PUT(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params, 'PUT')
}

export async function DELETE(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params, 'DELETE')
}
