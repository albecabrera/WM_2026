import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Closes when first group match kicks off
const WINNER_TIP_DEADLINE = new Date('2026-06-11T18:00:00')

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const tip = await prisma.tournamentWinnerTip.findUnique({
    where: { userId: session.id },
    include: { team: { select: { id: true, name: true, shortName: true, flagEmoji: true } } },
  })
  return NextResponse.json(tip ?? null)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  // Players (students and teachers) tip; admins don't compete.
  if (!session || session.role === 'ADMIN')
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  if (new Date() >= WINNER_TIP_DEADLINE)
    return NextResponse.json({ error: 'Turniersieger-Tipp ist geschlossen' }, { status: 400 })

  const { teamId } = await req.json()
  if (!teamId) return NextResponse.json({ error: 'Team fehlt' }, { status: 400 })

  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team) return NextResponse.json({ error: 'Team nicht gefunden' }, { status: 404 })

  const tip = await prisma.tournamentWinnerTip.upsert({
    where: { userId: session.id },
    update: { teamId },
    create: { userId: session.id, teamId },
    include: { team: { select: { id: true, name: true, shortName: true, flagEmoji: true } } },
  })

  return NextResponse.json(tip)
}
