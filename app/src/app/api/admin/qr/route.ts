import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN')
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const code = req.nextUrl.searchParams.get('code')
  if (!code) return new Response('Code fehlt', { status: 400 })

  const dataUrl = await QRCode.toDataURL(code, {
    width: 200,
    margin: 2,
    color: { dark: '#0a0e1a', light: '#f5c842' },
  })

  const base64 = dataUrl.replace('data:image/png;base64,', '')
  const buffer = Buffer.from(base64, 'base64')

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
