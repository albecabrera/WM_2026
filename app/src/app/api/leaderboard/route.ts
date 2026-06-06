import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const classCode = req.nextUrl.searchParams.get('class')

  // Teachers can only see their class (unless admin)
  const filterClass =
    session.role === 'ADMIN'
      ? classCode || undefined
      : session.role === 'TEACHER'
      ? session.classCode
      : undefined

  const users = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      ...(filterClass ? { classCode: filterClass } : {}),
    },
    include: {
      tips: { where: { points: { not: null } } },
      tournamentWinnerTip: true,
    },
  })

  const leaderboard = users
    .map((u) => {
      const tipPoints = u.tips.reduce((sum, t) => sum + (t.points ?? 0), 0)
      const winnerPoints = u.tournamentWinnerTip?.points ?? 0
      return {
        id: u.id,
        name: u.name,
        classCode: u.classCode,
        totalPoints: tipPoints + winnerPoints,
        tipCount: u.tips.length,
        exactResults: u.tips.filter((t) => t.points === 3).length,
      }
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((u, i) => ({ ...u, rank: i + 1 }))

  return NextResponse.json(leaderboard)
}
