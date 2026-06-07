import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN')
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const { teamId } = await req.json()
  if (!teamId) return NextResponse.json({ error: 'Team fehlt' }, { status: 400 })

  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team) return NextResponse.json({ error: 'Team nicht gefunden' }, { status: 404 })

  const allTips = await prisma.tournamentWinnerTip.findMany()
  let correct = 0

  for (const tip of allTips) {
    const points = tip.teamId === teamId ? 5 : 0
    await prisma.tournamentWinnerTip.update({ where: { id: tip.id }, data: { points } })
    if (points === 5) correct++
  }

  return NextResponse.json({ success: true, winner: team, tipsTotal: allTips.length, tipsCorrect: correct })
}
