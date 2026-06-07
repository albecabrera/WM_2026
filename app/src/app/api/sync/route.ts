import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { calculatePoints } from '@/lib/points'
import { fetchWorldCupMatches, hasApiKey, type NormalizedTeam, type NormalizedMatch } from '@/lib/football-api'

const THROTTLE_MS = 5 * 60 * 1000 // 5 minutos

async function getState() {
  return prisma.syncState.upsert({
    where: { id: 'main' },
    create: { id: 'main' },
    update: {},
  })
}

async function upsertTeam(t: NormalizedTeam, group: string | null) {
  const byExt = await prisma.team.findUnique({ where: { externalId: t.externalId } })
  if (byExt) {
    return prisma.team.update({
      where: { id: byExt.id },
      data: { name: t.name, shortName: t.shortName, flagEmoji: t.flagEmoji, ...(group ? { group } : {}) },
    })
  }
  const byName = await prisma.team.findUnique({ where: { name: t.name } })
  if (byName) {
    return prisma.team.update({
      where: { id: byName.id },
      data: { externalId: t.externalId, shortName: t.shortName, flagEmoji: t.flagEmoji, ...(group ? { group } : {}) },
    })
  }
  return prisma.team.create({
    data: { name: t.name, shortName: t.shortName, flagEmoji: t.flagEmoji, externalId: t.externalId, group },
  })
}

async function runSync() {
  const apiMatches = await fetchWorldCupMatches()
  if (apiMatches.length === 0) return { imported: 0, finished: 0, note: 'API ohne Spiele' }

  // Ordenar por kickoff para asignar números de partido legibles
  apiMatches.sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime())

  // Resolver/crear equipos y construir mapa externalId → team.id
  const teamId: Record<number, string> = {}
  for (const m of apiMatches) {
    for (const t of [m.homeTeam, m.awayTeam]) {
      if (t && !(t.externalId in teamId)) {
        const saved = await upsertTeam(t, m.group)
        teamId[t.externalId] = saved.id
      }
    }
  }

  // Upsert de partidos por externalId + recálculo de puntos en los finalizados
  let finished = 0
  let num = 0
  for (const m of apiMatches) {
    num++
    const data = {
      matchNumber: num,
      phase: m.phase,
      group: m.group,
      round: m.round,
      homeTeamId: m.homeTeam ? teamId[m.homeTeam.externalId] : null,
      awayTeamId: m.awayTeam ? teamId[m.awayTeam.externalId] : null,
      kickoff: m.kickoff,
      venue: m.venue,
      status: m.status,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
    }
    const match = await prisma.match.upsert({
      where: { externalId: m.externalId },
      create: { externalId: m.externalId, ...data },
      update: data,
    })

    if (m.status === 'FINISHED' && m.homeGoals !== null && m.awayGoals !== null) {
      finished++
      const tips = await prisma.tip.findMany({ where: { matchId: match.id } })
      for (const tip of tips) {
        const points = calculatePoints({
          tipHome: tip.homeGoals,
          tipAway: tip.awayGoals,
          actualHome: m.homeGoals,
          actualAway: m.awayGoals,
        })
        if (points !== tip.points) {
          await prisma.tip.update({ where: { id: tip.id }, data: { points } })
        }
      }
    }
  }

  // Eliminar partidos placeholder (sin externalId) que nadie tipeó
  await prisma.match.deleteMany({
    where: { externalId: null, tips: { none: {} } },
  })

  return { imported: apiMatches.length, finished }
}

// GET /api/sync — estado + sync con throttle (lo dispara el cliente al abrir la app)
export async function GET(req: NextRequest) {
  // force solo lo respetan admin/lehrer (evita que se martille la API externa)
  const session = await getSession()
  const isStaff = !!session && (session.role === 'ADMIN' || session.role === 'TEACHER')
  const force = isStaff && req.nextUrl.searchParams.get('force') === '1'
  const state = await getState()

  if (!hasApiKey()) {
    return NextResponse.json({ ok: false, reason: 'no-api-key', lastSyncAt: state.lastSyncAt })
  }

  const fresh = state.lastSyncAt && Date.now() - new Date(state.lastSyncAt).getTime() < THROTTLE_MS
  if (fresh && !force) {
    return NextResponse.json({ ok: true, skipped: true, lastSyncAt: state.lastSyncAt, lastStatus: state.lastStatus })
  }

  try {
    const result = await runSync()
    const updated = await prisma.syncState.update({
      where: { id: 'main' },
      data: { lastSyncAt: new Date(), lastStatus: `${result.imported} Spiele, ${result.finished} beendet` },
    })
    return NextResponse.json({ ok: true, ...result, lastSyncAt: updated.lastSyncAt, lastStatus: updated.lastStatus })
  } catch (e: any) {
    await prisma.syncState.update({
      where: { id: 'main' },
      data: { lastStatus: `Fehler: ${e.message ?? 'unbekannt'}` },
    })
    return NextResponse.json({ ok: false, error: e.message ?? 'Sync fehlgeschlagen' }, { status: 502 })
  }
}

// POST /api/sync?force=1 — sync forzado (solo admin/lehrer)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER'))
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
  return GET(req)
}
