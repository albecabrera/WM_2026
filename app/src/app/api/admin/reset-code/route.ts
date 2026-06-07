import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function normalize(name: string): string {
  return name.toLowerCase()
    .replace(/ü/g, 'ue').replace(/ö/g, 'oe').replace(/ä/g, 'ae').replace(/ß/g, 'ss')
    .replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
}

// POST /api/admin/reset-code
// Body: { query: '#müller', action: 'lookup' | 'reset' }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER'))
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const { query, action = 'lookup' } = await req.json()
  if (!query) return NextResponse.json({ error: 'Name fehlt' }, { status: 400 })

  const raw = String(query).replace(/^#/, '').trim()
  const normalized = normalize(raw)

  // Search by loginCode prefix (most reliable — loginCode = normalize(name) + class)
  const users = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: [{ classCode: 'asc' }, { name: 'asc' }],
  })

  const matches = users.filter(
    (u) => normalize(u.name).includes(normalized) || u.loginCode.startsWith(normalized)
  )

  if (matches.length === 0)
    return NextResponse.json({ error: `Kein Schüler gefunden für "#${raw}"` }, { status: 404 })

  if (action === 'lookup') {
    return NextResponse.json(matches.map((u) => ({ id: u.id, name: u.name, classCode: u.classCode, loginCode: u.loginCode })))
  }

  // action === 'reset' — only works for single match to avoid accidents
  if (matches.length > 1)
    return NextResponse.json({
      error: 'Mehrere Schüler gefunden. Vollständigen Namen eingeben.',
      matches: matches.map((u) => ({ name: u.name, classCode: u.classCode, loginCode: u.loginCode })),
    }, { status: 409 })

  const user = matches[0]
  const base = normalize(user.name) + user.classCode

  // Generate unique code
  let newCode = base
  let suffix = 2
  while (await prisma.user.findUnique({ where: { loginCode: newCode } })) {
    newCode = `${base}${suffix++}`
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { loginCode: newCode },
  })

  return NextResponse.json({ success: true, name: updated.name, classCode: updated.classCode, newCode })
}
