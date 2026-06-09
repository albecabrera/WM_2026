import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ALL_CLASS_CODES } from '@/lib/classes'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const filterClass = req.nextUrl.searchParams.get('class') || undefined

  const users = await prisma.user.findMany({
    where: {
      role: { in: ['STUDENT', 'TEACHER'] },
      classCode: filterClass
        ? { equals: filterClass }
        : { in: ALL_CLASS_CODES },
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
        role: u.role,
        totalPoints: tipPoints + winnerPoints,
        tipCount: u.tips.length,
        exactResults: u.tips.filter((t) => t.points === 3).length,
      }
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((u, i) => ({ ...u, rank: i + 1 }))

  return NextResponse.json(leaderboard)
}
