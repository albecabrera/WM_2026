import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// PUT /api/admin/ko — assign teams to a KO match slot
export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER'))
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const { matchId, homeTeamId, awayTeamId } = await req.json()
  if (!matchId) return NextResponse.json({ error: 'Match-ID fehlt' }, { status: 400 })

  const data: Record<string, string | null> = {}
  if (homeTeamId !== undefined) data.homeTeamId = homeTeamId || null
  if (awayTeamId !== undefined) data.awayTeamId = awayTeamId || null

  const match = await prisma.match.update({
    where: { id: matchId },
    data,
    include: { homeTeam: true, awayTeam: true },
  })

  return NextResponse.json(match)
}

// GET /api/admin/ko — list all KO matches with teams
export async function GET() {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER'))
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const matches = await prisma.match.findMany({
    where: { phase: { not: 'GROUP' } },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { matchNumber: 'asc' },
  })

  return NextResponse.json(matches)
}
