'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeProvider'

interface Team { name: string; shortName: string; flagEmoji: string }
interface Match {
  id: string
  matchNumber: number
  phase: string
  round?: string
  homeTeam?: Team | null
  awayTeam?: Team | null
  kickoff: string
  status: string
  venue: string
  homeGoals?: number | null
  awayGoals?: number | null
  userTip?: { homeGoals: number; awayGoals: number; points?: number } | null
}

const ROUND_LABELS: Record<string, string> = {
  R32: 'Runde der 32',
  R16: 'Achtelfinale',
  QF: 'Viertelfinale',
  SF: 'Halbfinale',
  '3RD': 'Spiel um Platz 3',
  FINAL: 'Finale',
}

const ROUND_ORDER = ['R32', 'R16', 'QF', 'SF', '3RD', 'FINAL']

export default function KOPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [tips, setTips] = useState<Record<string, { home: string; away: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [activeRound, setActiveRound] = useState<string>('R32')

  const fetchKO = useCallback(async () => {
    const phases = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL']
    const res = await Promise.all(phases.map((p) => fetch(`/api/matches?phase=${p}`).then((r) => r.json())))
    const all = res.flat().filter(Array.isArray).flat()
    if (all.length > 0) {
      setMatches(all)
      const prefilled: Record<string, { home: string; away: string }> = {}
      all.forEach((m: Match) => {
        if (m.userTip) prefilled[m.id] = { home: String(m.userTip.homeGoals), away: String(m.userTip.awayGoals) }
      })
      setTips((prev) => ({ ...prefilled, ...prev }))
    }
  }, [])

  useEffect(() => { fetchKO() }, [fetchKO])
  useEffect(() => {
    const id = setInterval(fetchKO, 30_000)
    return () => clearInterval(id)
  }, [fetchKO])

  const matchesByRound = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const r = m.round ?? 'R32'
    if (!acc[r]) acc[r] = []
    acc[r].push(m)
    return acc
  }, {})

  const activeRounds = ROUND_ORDER.filter((r) => matchesByRound[r]?.length > 0)

  function isTippable(match: Match) {
    if (!match.homeTeam || !match.awayTeam) return false
    const cutoff = new Date(new Date(match.kickoff).getTime() - 5 * 60 * 1000)
    return match.status === 'UPCOMING' && new Date() < cutoff
  }

  async function saveTip(matchId: string) {
    const tip = tips[matchId]
    if (!tip || tip.home === '' || tip.away === '') return
    setSaving(matchId)
    const res = await fetch('/api/tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, homeGoals: Number(tip.home), awayGoals: Number(tip.away) }),
    })
    setSaving(null)
    if (res.ok) {
      setSaved((prev) => ({ ...prev, [matchId]: true }))
      setTimeout(() => setSaved((prev) => ({ ...prev, [matchId]: false })), 2000)
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('de-DE', {
      weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    })
  }

  const roundMatches = matchesByRound[activeRound] ?? []

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: '60px', gap: '1rem' }}>
          <Link href="/dashboard" style={{ color: 'var(--c-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>← Gruppen</Link>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--c-gold)', flex: 1 }}>⚽ KO-Runden</span>
          <Link href="/leaderboard" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Rangliste</Link>
          <ThemeToggle />
          <a href="/api/auth/logout" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Abmelden</a>
        </div>
      </nav>

      <div className="container relative" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h2 style={{ marginBottom: '0.25rem' }}>KO-Runden</h2>
        <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Tipp bis 5 Min. vor Anpfiff abgeben
        </p>

        {/* Round tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
          {(activeRounds.length > 0 ? activeRounds : ROUND_ORDER).map((r) => (
            <button key={r} onClick={() => setActiveRound(r)} style={{
              padding: '0.35rem 0.9rem', borderRadius: 'var(--r-sm)', border: '1px solid',
              borderColor: activeRound === r ? 'var(--c-gold)' : 'var(--c-border)',
              background: activeRound === r ? 'rgba(245,200,66,0.1)' : 'transparent',
              color: activeRound === r ? 'var(--c-gold)' : 'var(--c-muted)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.15s',
            }}>
              {ROUND_LABELS[r] ?? r}
            </button>
          ))}
        </div>

        {roundMatches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--c-hint)', marginBottom: '0.5rem' }}>Noch keine Teams für diese Runde</p>
            <p style={{ color: 'var(--c-hint)', fontSize: '0.82rem' }}>Der Admin weist die Teams zu, sobald die Gruppenphase beendet ist.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {roundMatches.map((match) => {
              const tippable = isTippable(match)
              const tip = tips[match.id]
              const hasTip = tip && tip.home !== '' && tip.away !== ''
              const isLive = match.status === 'LIVE'
              const teamsKnown = !!(match.homeTeam && match.awayTeam)

              return (
                <div key={match.id} className={`match-card ${hasTip ? 'has-tip' : ''} ${!teamsKnown ? '' : !tippable && match.status === 'UPCOMING' ? 'locked' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>
                      Spiel #{match.matchNumber} · {formatDate(match.kickoff)} · {match.venue}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {isLive && <span className="badge badge-red pulse">● LIVE</span>}
                      {match.status === 'FINISHED' && match.userTip?.points !== undefined && (
                        <span className={`badge ${match.userTip.points === 3 ? 'badge-gold' : match.userTip.points > 0 ? 'badge-green' : 'badge-muted'}`}>
                          +{match.userTip.points} Pkt
                        </span>
                      )}
                      {!tippable && match.status === 'UPCOMING' && teamsKnown && (
                        <span className="badge badge-red">Gesperrt</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                    <div className="team-display" style={{ opacity: teamsKnown ? 1 : 0.4 }}>
                      <span className="team-flag">{teamsKnown ? match.homeTeam!.flagEmoji : '❓'}</span>
                      <span className="team-name">{teamsKnown ? match.homeTeam!.shortName : 'TBD'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {match.status === 'FINISHED' || isLive ? (
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: '1.8rem',
                          color: isLive ? 'var(--c-red)' : 'var(--c-text)',
                        }}>
                          {match.homeGoals} : {match.awayGoals}
                        </span>
                      ) : (
                        <>
                          <input type="number" className="score-input" min="0" max="20" placeholder="–"
                            value={tip?.home ?? ''} disabled={!tippable}
                            onChange={(e) => setTips((prev) => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))} />
                          <span className="vs">:</span>
                          <input type="number" className="score-input" min="0" max="20" placeholder="–"
                            value={tip?.away ?? ''} disabled={!tippable}
                            onChange={(e) => setTips((prev) => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))} />
                        </>
                      )}
                    </div>

                    <div className="team-display" style={{ opacity: teamsKnown ? 1 : 0.4 }}>
                      <span className="team-flag">{teamsKnown ? match.awayTeam!.flagEmoji : '❓'}</span>
                      <span className="team-name">{teamsKnown ? match.awayTeam!.shortName : 'TBD'}</span>
                    </div>
                  </div>

                  {match.status !== 'FINISHED' && !isLive && match.userTip && teamsKnown && (
                    <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--c-muted)' }}>
                      Dein Tipp: {match.userTip.homeGoals} : {match.userTip.awayGoals}
                    </div>
                  )}

                  {tippable && (
                    <button className="btn btn-primary" onClick={() => saveTip(match.id)}
                      disabled={!hasTip || saving === match.id}
                      style={{
                        width: '100%', marginTop: '0.75rem', justifyContent: 'center',
                        background: saved[match.id] ? 'var(--c-green)' : undefined,
                        color: saved[match.id] ? '#fff' : undefined,
                      }}>
                      {saving === match.id ? 'Speichern...' : saved[match.id] ? '✓ Gespeichert' : 'Tipp abgeben'}
                    </button>
                  )}

                  {!teamsKnown && (
                    <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--c-hint)' }}>
                      Teams werden nach der Gruppenphase bekannt gegeben
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
