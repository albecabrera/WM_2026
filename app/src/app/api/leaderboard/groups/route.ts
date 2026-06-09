import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ALL_CLASS_CODES } from '@/lib/classes'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const filterClass = req.nextUrl.searchParams.get('class') || undefined
  const classCodes = filterClass ? [filterClass] : ALL_CLASS_CODES

  const users = await prisma.user.findMany({
    where: { role: { in: ['STUDENT', 'TEACHER'] }, classCode: { in: classCodes } },
    include: {
      tips: { where: { points: { not: null } }, select: { points: true } },
      tournamentWinnerTip: { select: { points: true } },
    },
  })

  const byClass = new Map<
    string,
    { totalPoints: number; memberCount: number; top: { name: string; points: number } | null }
  >()
  for (const code of classCodes) {
    byClass.set(code, { totalPoints: 0, memberCount: 0, top: null })
  }

  for (const u of users) {
    const bucket = byClass.get(u.classCode)
    if (!bucket) continue
    const points =
      u.tips.reduce((s, t) => s + (t.points ?? 0), 0) + (u.tournamentWinnerTip?.points ?? 0)
    bucket.totalPoints += points
    bucket.memberCount += 1
    if (!bucket.top || points > bucket.top.points) {
      bucket.top = { name: u.name, points }
    }
  }

  const standings = Array.from(byClass.entries())
    .map(([classCode, b]) => ({
      classCode,
      totalPoints: b.totalPoints,
      memberCount: b.memberCount,
      avgPoints: b.memberCount ? Math.round((b.totalPoints / b.memberCount) * 10) / 10 : 0,
      topPlayer: b.top,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((g, i) => ({ ...g, rank: i + 1 }))

  return NextResponse.json(standings)
}
