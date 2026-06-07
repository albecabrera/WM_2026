import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/tips?matchId=... or GET /api/tips (all user tips)
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const matchId = req.nextUrl.searchParams.get('matchId')

  const tips = await prisma.tip.findMany({
    where: {
      userId: session.id,
      ...(matchId ? { matchId } : {}),
    },
    include: { match: { include: { homeTeam: true, awayTeam: true } } },
  })

  return NextResponse.json(tips)
}

// POST /api/tips
export async function POST(req: NextRequest) {
  const session = await getSession()
  // Players (students and teachers) tip; admins don't compete.
  if (!session || session.role === 'ADMIN')
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const { matchId, homeGoals, awayGoals } = await req.json()

  if (homeGoals < 0 || awayGoals < 0 || homeGoals > 20 || awayGoals > 20) {
    return NextResponse.json({ error: 'Ungültige Tore' }, { status: 400 })
  }

  // Check if match exists and is not started yet (5 min cutoff)
  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) return NextResponse.json({ error: 'Spiel nicht gefunden' }, { status: 404 })

  const cutoff = new Date(match.kickoff.getTime() - 5 * 60 * 1000)
  if (new Date() > cutoff) {
    return NextResponse.json({ error: 'Tipps sind geschlossen (Abgabe bis 5 Min. vor Anpfiff)' }, { status: 400 })
  }

  const tip = await prisma.tip.upsert({
    where: { userId_matchId: { userId: session.id, matchId } },
    update: { homeGoals, awayGoals },
    create: { userId: session.id, matchId, homeGoals, awayGoals },
  })

  return NextResponse.json(tip)
}
