import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getSchool, getClassCodesForSchool } from '@/lib/classes'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  // Admins don't compete — no stats.
  if (session.role === 'ADMIN') {
    return NextResponse.json({
      id: session.id,
      name: session.name,
      classCode: session.classCode,
      role: session.role,
      totalPoints: 0,
      tipCount: 0,
      rank: null,
      hasWinnerTip: false,
      winnerTipTeamId: null,
    })
  }

  // Rank is scoped to the user's own school (BBG vs ESG).
  const userSchool = getSchool(session.classCode)
  const schoolCodes = userSchool ? getClassCodesForSchool(userSchool) : undefined

  const PLAYER_ROLES = ['STUDENT', 'TEACHER']
  const [user, allPlayers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      include: {
        tips: { where: { points: { not: null } }, select: { points: true } },
        tournamentWinnerTip: { select: { teamId: true, points: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        role: { in: PLAYER_ROLES },
        ...(schoolCodes ? { classCode: { in: schoolCodes } } : {}),
      },
      include: {
        tips: { where: { points: { not: null } }, select: { points: true } },
        tournamentWinnerTip: { select: { points: true } },
      },
    }),
  ])

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const tipPoints = user.tips.reduce((s, t) => s + (t.points ?? 0), 0)
  const winnerPoints = user.tournamentWinnerTip?.points ?? 0
  const totalPoints = tipPoints + winnerPoints

  const sorted = allPlayers
    .map((u) => ({
      id: u.id,
      total: u.tips.reduce((s, t) => s + (t.points ?? 0), 0) + (u.tournamentWinnerTip?.points ?? 0),
    }))
    .sort((a, b) => b.total - a.total)

  const rank = sorted.findIndex((s) => s.id === session.id) + 1

  return NextResponse.json({
    id: session.id,
    name: session.name,
    classCode: session.classCode,
    role: session.role,
    totalPoints,
    tipCount: user.tips.length,
    rank,
    hasWinnerTip: !!user.tournamentWinnerTip,
    winnerTipTeamId: user.tournamentWinnerTip?.teamId ?? null,
  })
}
