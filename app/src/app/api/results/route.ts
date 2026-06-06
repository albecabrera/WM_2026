import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { calculatePoints } from '@/lib/points'

// POST /api/results - set match result and calculate points
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER'))
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const { matchId, homeGoals, awayGoals } = await req.json()

  // Update match
  const match = await prisma.match.update({
    where: { id: matchId },
    data: { homeGoals, awayGoals, status: 'FINISHED' },
  })

  // Teachers can only update their own class matches... for now allow all
  // Calculate points for all tips on this match
  const tips = await prisma.tip.findMany({ where: { matchId } })

  for (const tip of tips) {
    const points = calculatePoints({
      tipHome: tip.homeGoals,
      tipAway: tip.awayGoals,
      actualHome: homeGoals,
      actualAway: awayGoals,
    })
    await prisma.tip.update({
      where: { id: tip.id },
      data: { points },
    })
  }

  return NextResponse.json({ success: true, tipsUpdated: tips.length })
}
