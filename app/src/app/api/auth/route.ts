import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { loginCode } = await req.json()

  if (!loginCode) {
    return NextResponse.json({ error: 'Login-Code fehlt' }, { status: 400 })
  }

  const normalized = loginCode.toLowerCase().trim()

  // Check if it's a teacher code
  const classRecord = await prisma.class.findUnique({
    where: { teacherCode: normalized },
  })

  if (classRecord) {
    const token = signToken({
      id: `teacher-${classRecord.id}`,
      name: `Lehrer ${classRecord.name}`,
      classCode: classRecord.code,
      role: 'TEACHER',
      loginCode: normalized,
    })
    const res = NextResponse.json({ success: true, role: 'TEACHER' })
    res.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  }

  // Check student / admin
  const user = await prisma.user.findUnique({ where: { loginCode: normalized } })

  if (!user) {
    return NextResponse.json({ error: 'Ungültiger Login-Code' }, { status: 401 })
  }

  const token = signToken({
    id: user.id,
    name: user.name,
    classCode: user.classCode,
    role: user.role as 'STUDENT' | 'TEACHER' | 'ADMIN',
    loginCode: user.loginCode,
  })

  const res = NextResponse.json({ success: true, role: user.role })
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
