import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getSchool, getClassCodesForSchool } from '@/lib/classes'

// POST /api/admin/users - create a student
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN')
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const { name, classCode } = await req.json()

  if (!name || !classCode) {
    return NextResponse.json({ error: 'Name und Klasse erforderlich' }, { status: 400 })
  }

  // Generate login code: fantasy-name + "-" + class (matches seed format)
  const loginCode = `${name.toLowerCase().replace(/\s+/g, '').replace(/ü/g,'ue').replace(/ö/g,'oe').replace(/ä/g,'ae').replace(/ß/g,'ss')}-${classCode}`

  const existing = await prisma.user.findUnique({ where: { loginCode } })
  if (existing) {
    return NextResponse.json({ error: `Login-Code "${loginCode}" bereits vergeben` }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: { name, classCode, loginCode, role: 'STUDENT' },
  })

  return NextResponse.json({ user, loginCode })
}

// GET /api/admin - list students (admin: all or ?school=; teacher: own class only)
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER'))
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const classCodeParam = req.nextUrl.searchParams.get('class')
  const schoolParam = req.nextUrl.searchParams.get('school') as 'bbg' | 'esg' | null

  let classCodes: string[] | undefined
  if (session.role === 'TEACHER') {
    classCodes = [session.classCode]
  } else if (classCodeParam) {
    classCodes = [classCodeParam]
  } else if (schoolParam) {
    classCodes = getClassCodesForSchool(schoolParam)
  }
  // ADMIN with no filter → returns all schools

  const users = await prisma.user.findMany({
    where: {
      role: { in: ['STUDENT', 'TEACHER'] },
      ...(classCodes ? { classCode: { in: classCodes } } : {}),
    },
    orderBy: [{ classCode: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(users)
}
