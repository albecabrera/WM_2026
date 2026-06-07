// Cliente de football-data.org (v4) para la Copa del Mundo.
// Free tier: clave gratis en https://www.football-data.org/client/register
// Competición: WC (FIFA World Cup). Header: X-Auth-Token.
//
// Si no hay FOOTBALL_API_KEY, todo es no-op y la app funciona en modo manual.

import { resolveTeam } from './teams-data'

const API_BASE = process.env.FOOTBALL_API_BASE || 'https://api.football-data.org/v4'
const COMPETITION = process.env.FOOTBALL_API_COMPETITION || 'WC'

export function hasApiKey(): boolean {
  return !!process.env.FOOTBALL_API_KEY
}

// ── Normalización ───────────────────────────────────────────

// football-data stage → nuestra phase + round
const STAGE_MAP: Record<string, { phase: string; round: string | null }> = {
  GROUP_STAGE: { phase: 'GROUP', round: null },
  LAST_32: { phase: 'ROUND_OF_32', round: 'R32' },
  ROUND_OF_32: { phase: 'ROUND_OF_32', round: 'R32' },
  LAST_16: { phase: 'ROUND_OF_16', round: 'R16' },
  ROUND_OF_16: { phase: 'ROUND_OF_16', round: 'R16' },
  QUARTER_FINALS: { phase: 'QUARTER_FINAL', round: 'QF' },
  SEMI_FINALS: { phase: 'SEMI_FINAL', round: 'SF' },
  THIRD_PLACE: { phase: 'SEMI_FINAL', round: '3RD' },
  FINAL: { phase: 'FINAL', round: 'FINAL' },
}

// football-data status → nuestro status
function mapStatus(s: string): string {
  switch (s) {
    case 'IN_PLAY':
    case 'PAUSED':
      return 'LIVE'
    case 'FINISHED':
    case 'AWARDED':
      return 'FINISHED'
    default:
      return 'UPCOMING' // SCHEDULED, TIMED, POSTPONED, SUSPENDED, CANCELLED
  }
}

export interface NormalizedTeam {
  externalId: number
  name: string
  shortName: string
  flagEmoji: string
}

export interface NormalizedMatch {
  externalId: number
  phase: string
  group: string | null
  round: string | null
  kickoff: Date
  venue: string
  status: string
  homeGoals: number | null
  awayGoals: number | null
  homeTeam: NormalizedTeam | null
  awayTeam: NormalizedTeam | null
}

function normalizeTeam(t: any): NormalizedTeam | null {
  if (!t || !t.id) return null
  const info = resolveTeam(t.tla ?? null, t.name ?? t.shortName ?? '')
  return {
    externalId: t.id,
    name: info.name,
    shortName: info.shortName,
    flagEmoji: info.flagEmoji,
  }
}

function normalizeGroup(g: string | null | undefined): string | null {
  if (!g) return null
  // football-data devuelve "GROUP_A" → "A"
  const m = g.match(/GROUP_([A-L])/i)
  return m ? m[1].toUpperCase() : null
}

export function normalizeMatch(m: any): NormalizedMatch | null {
  if (!m || !m.id) return null
  const stage = STAGE_MAP[m.stage] ?? { phase: 'GROUP', round: null }
  const score = m.score?.fullTime ?? {}
  return {
    externalId: m.id,
    phase: stage.phase,
    group: stage.phase === 'GROUP' ? normalizeGroup(m.group) : null,
    round: stage.round,
    kickoff: new Date(m.utcDate),
    venue: m.venue ?? '—',
    status: mapStatus(m.status),
    homeGoals: typeof score.home === 'number' ? score.home : null,
    awayGoals: typeof score.away === 'number' ? score.away : null,
    homeTeam: normalizeTeam(m.homeTeam),
    awayTeam: normalizeTeam(m.awayTeam),
  }
}

// ── Fetch ───────────────────────────────────────────────────

export async function fetchWorldCupMatches(): Promise<NormalizedMatch[]> {
  const key = process.env.FOOTBALL_API_KEY
  if (!key) throw new Error('FOOTBALL_API_KEY fehlt')

  const res = await fetch(`${API_BASE}/competitions/${COMPETITION}/matches`, {
    headers: { 'X-Auth-Token': key },
    // No cachear: queremos datos frescos en cada sync
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`football-data ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = await res.json()
  const matches: any[] = data.matches ?? []
  return matches
    .map(normalizeMatch)
    .filter((m): m is NormalizedMatch => m !== null)
}
