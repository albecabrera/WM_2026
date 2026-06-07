import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const phase = req.nextUrl.searchParams.get('phase')
  const group = req.nextUrl.searchParams.get('group')
  const upcoming = req.nextUrl.searchParams.get('upcoming') === 'true'

  const now = new Date()

  const matches = await prisma.match.findMany({
    where: {
      ...(phase ? { phase } : {}),
      ...(group ? { group } : {}),
      ...(upcoming ? { kickoff: { gte: now }, status: 'UPCOMING' } : {}),
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoff: 'asc' },
    take: upcoming ? 10 : undefined,
  })

  // Attach the player's own tip (students and teachers both play)
  if (session.role !== 'ADMIN') {
    const matchIds = matches.map((m) => m.id)
    const tips = await prisma.tip.findMany({
      where: { userId: session.id, matchId: { in: matchIds } },
    })
    const tipMap: Record<string, (typeof tips)[0]> = {}
    tips.forEach((t) => (tipMap[t.matchId] = t))

    return NextResponse.json(matches.map((m) => ({ ...m, userTip: tipMap[m.id] || null })))
  }

  return NextResponse.json(matches)
}
