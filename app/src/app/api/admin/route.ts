import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST /api/admin/users - create a student
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN')
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const { name, classCode } = await req.json()

  if (!name || !classCode) {
    return NextResponse.json({ error: 'Name und Klasse erforderlich' }, { status: 400 })
  }

  // Generate login code: lastname + class
  const loginCode = `${name.toLowerCase().replace(/\s+/g, '').replace(/ü/g,'ue').replace(/ö/g,'oe').replace(/ä/g,'ae').replace(/ß/g,'ss')}${classCode}`

  const existing = await prisma.user.findUnique({ where: { loginCode } })
  if (existing) {
    return NextResponse.json({ error: `Login-Code "${loginCode}" bereits vergeben` }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: { name, classCode, loginCode, role: 'STUDENT' },
  })

  return NextResponse.json({ user, loginCode })
}

// GET /api/admin/users - list all students
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN')
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const classCode = req.nextUrl.searchParams.get('class')

  const users = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      ...(classCode ? { classCode } : {}),
    },
    orderBy: [{ classCode: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(users)
}
