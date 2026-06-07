import { NextRequest, NextResponse } from 'next/server'
import { getSession, isTeacherOrAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ALL_CLASSES, getSchool } from '@/lib/classes'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || !isTeacherOrAdmin(session))
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const filterClass = req.nextUrl.searchParams.get('class')
  const schoolParam = req.nextUrl.searchParams.get('school') as 'bbg' | 'esg' | null

  // Teachers restricted to own class; admin can filter by school or class
  const teacherSchool = getSchool(session.classCode)
  const allowedClasses =
    session.role === 'ADMIN'
      ? filterClass
        ? [filterClass]
        : schoolParam
          ? ALL_CLASSES.filter((c) => getSchool(c.code) === schoolParam).map((c) => c.code)
          : ALL_CLASSES.map((c) => c.code)
      : [session.classCode]

  const users = await prisma.user.findMany({
    where: { classCode: { in: allowedClasses } },
    select: { name: true, classCode: true, loginCode: true, role: true },
    orderBy: [{ classCode: 'asc' }, { role: 'asc' }, { name: 'asc' }],
  })

  const result = allowedClasses
    .filter((code) => ALL_CLASSES.some((c) => c.code === code))
    .map((code) => {
      const classUsers = users.filter((u) => u.classCode === code)
      return {
        code,
        name: ALL_CLASSES.find((c) => c.code === code)?.label ?? code,
        teachers: classUsers.filter((u) => u.role === 'TEACHER'),
        students: classUsers.filter((u) => u.role === 'STUDENT'),
      }
    })

  return NextResponse.json(result)
}
