import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const BRACKET: Record<number, { next: number; slot: 'home' | 'away' }> = {
  73: { next: 89, slot: 'home' }, 74: { next: 89, slot: 'away' },
  75: { next: 90, slot: 'home' }, 76: { next: 90, slot: 'away' },
  77: { next: 91, slot: 'home' }, 78: { next: 91, slot: 'away' },
  79: { next: 92, slot: 'home' }, 80: { next: 92, slot: 'away' },
  81: { next: 93, slot: 'home' }, 82: { next: 93, slot: 'away' },
  83: { next: 94, slot: 'home' }, 84: { next: 94, slot: 'away' },
  85: { next: 95, slot: 'home' }, 86: { next: 95, slot: 'away' },
  87: { next: 96, slot: 'home' }, 88: { next: 96, slot: 'away' },
  89: { next: 97, slot: 'home' }, 90: { next: 97, slot: 'away' },
  91: { next: 98, slot: 'home' }, 92: { next: 98, slot: 'away' },
  93: { next: 99, slot: 'home' }, 94: { next: 99, slot: 'away' },
  95: { next: 100, slot: 'home' }, 96: { next: 100, slot: 'away' },
  97: { next: 101, slot: 'home' }, 98: { next: 101, slot: 'away' },
  99: { next: 102, slot: 'home' }, 100: { next: 102, slot: 'away' },
}

const SF_BRACKET: Record<number, {
  winnerNext: number; winnerSlot: 'home' | 'away'
  loserNext: number; loserSlot: 'home' | 'away'
}> = {
  101: { winnerNext: 104, winnerSlot: 'home', loserNext: 103, loserSlot: 'home' },
  102: { winnerNext: 104, winnerSlot: 'away', loserNext: 103, loserSlot: 'away' },
}

// POST /api/admin/advance — manually advance winner (after ET/penalties)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER'))
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  const { matchId, winnerId } = await req.json()
  if (!matchId || !winnerId) return NextResponse.json({ error: 'matchId und winnerId erforderlich' }, { status: 400 })

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  })
  if (!match) return NextResponse.json({ error: 'Match nicht gefunden' }, { status: 404 })

  const loserId = winnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId

  const bracket = BRACKET[match.matchNumber]
  const sfBracket = SF_BRACKET[match.matchNumber]

  if (bracket) {
    const next = await prisma.match.findFirst({ where: { matchNumber: bracket.next } })
    if (next) {
      await prisma.match.update({
        where: { id: next.id },
        data: bracket.slot === 'home' ? { homeTeamId: winnerId } : { awayTeamId: winnerId },
      })
    }
  } else if (sfBracket) {
    const finalMatch = await prisma.match.findFirst({ where: { matchNumber: sfBracket.winnerNext } })
    if (finalMatch) {
      await prisma.match.update({
        where: { id: finalMatch.id },
        data: sfBracket.winnerSlot === 'home' ? { homeTeamId: winnerId } : { awayTeamId: winnerId },
      })
    }
    if (loserId) {
      const thirdMatch = await prisma.match.findFirst({ where: { matchNumber: sfBracket.loserNext } })
      if (thirdMatch) {
        await prisma.match.update({
          where: { id: thirdMatch.id },
          data: sfBracket.loserSlot === 'home' ? { homeTeamId: loserId } : { awayTeamId: loserId },
        })
      }
    }
  } else {
    return NextResponse.json({ error: 'Kein Bracket für dieses Spiel' }, { status: 400 })
  }

  const winnerTeam = winnerId === match.homeTeamId ? match.homeTeam : match.awayTeam
  return NextResponse.json({ success: true, advancedTeamName: winnerTeam?.name })
}
