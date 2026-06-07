'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'

interface Team { id: string; name: string; shortName: string; flagEmoji: string; group?: string }
interface Match {
  id: string
  matchNumber: number
  phase: string
  group?: string
  homeTeam?: Team
  awayTeam?: Team
  kickoff: string
  status: string
  venue: string
  homeGoals?: number
  awayGoals?: number
  userTip?: { homeGoals: number; awayGoals: number; points?: number } | null
}
interface Me {
  name: string; classCode: string; totalPoints: number; tipCount: number; rank: number | null
  hasWinnerTip: boolean; winnerTipTeamId: string | null
}
interface WinnerTip { teamId: string; team: Team }

const TOURNAMENT_START = new Date('2026-06-11T18:00:00')
const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [tips, setTips] = useState<Record<string, { home: string; away: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [activeGroup, setActiveGroup] = useState<string>('A')
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [winnerTip, setWinnerTip] = useState<WinnerTip | null>(null)
  const [winnerTeamId, setWinnerTeamId] = useState('')
  const [savingWinner, setSavingWinner] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [toast, setToast] = useState('')
  const prevMatchesRef = useRef<Match[]>([])

  const isWinnerOpen = new Date() < TOURNAMENT_START

  const fetchMatches = useCallback(async () => {
    const res = await fetch('/api/matches?phase=GROUP')
    const data = await res.json()
    if (!Array.isArray(data)) return

    // Check for new results (for toast notification)
    const prev = prevMatchesRef.current
    const newFinished = data.filter((m: Match) =>
      m.status === 'FINISHED' && prev.find((p) => p.id === m.id && p.status !== 'FINISHED')
    )
    if (newFinished.length > 0 && prev.length > 0) {
      const m = newFinished[0]
      setToast(`🔴 Ergebnis: ${m.homeTeam?.shortName} ${m.homeGoals}:${m.awayGoals} ${m.awayTeam?.shortName}`)
      setTimeout(() => setToast(''), 5000)
    }
    prevMatchesRef.current = data

    setMatches(data)
    const prefilled: Record<string, { home: string; away: string }> = {}
    data.forEach((m: Match) => {
      if (m.userTip) prefilled[m.id] = { home: String(m.userTip.homeGoals), away: String(m.userTip.awayGoals) }
    })
    setTips((prev) => ({ ...prefilled, ...prev }))
    setLastRefresh(new Date())
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    const res = await fetch('/api/leaderboard')
    const data = await res.json()
    if (Array.isArray(data)) setLeaderboard(data.slice(0, 10))
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then((r) => r.json()).then((d) => { if (!d.error) setMe(d) }),
      fetch('/api/tips/winner').then((r) => r.json()).then((d) => { if (d) { setWinnerTip(d); setWinnerTeamId(d.teamId) } }),
      isWinnerOpen ? fetch('/api/teams').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setTeams(d) }) : Promise.resolve(),
      fetchMatches(),
      fetchLeaderboard(),
    ])
  }, [fetchMatches, fetchLeaderboard, isWinnerOpen])

  useEffect(() => {
    const id = setInterval(() => {
      fetchMatches()
      fetchLeaderboard()
    }, 30_000)
    return () => clearInterval(id)
  }, [fetchMatches, fetchLeaderboard])

  const groupMatches = matches.filter((m) => m.group === activeGroup)

  function isTippable(match: Match) {
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

  async function saveWinnerTip() {
    if (!winnerTeamId) return
    setSavingWinner(true)
    const res = await fetch('/api/tips/winner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: winnerTeamId }),
    })
    const data = await res.json()
    setSavingWinner(false)
    if (res.ok) {
      setWinnerTip(data)
      setMe((prev) => prev ? { ...prev, hasWinnerTip: true, winnerTipTeamId: winnerTeamId } : prev)
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('de-DE', {
      weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    })
  }

  const teamsByGroup = teams.reduce<Record<string, Team[]>>((acc, t) => {
    const g = t.group ?? 'Z'
    if (!acc[g]) acc[g] = []
    acc[g].push(t)
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '1rem', zIndex: 200,
          background: 'var(--c-surface)', border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 'var(--r-md)', padding: '0.75rem 1.25rem',
          color: 'var(--c-text)', fontSize: '0.9rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeUp 0.3s ease',
        }}>
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav className="nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--c-gold)' }}>⚽ WM 2026</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link href="/dashboard/ko" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>KO-Runden</Link>
            <Link href="/leaderboard" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Rangliste</Link>
            <a href="/api/auth/logout" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Abmelden</a>
          </div>
        </div>
      </nav>

      <div className="container relative" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

        {/* User stats */}
        {me && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>
              Hallo, {me.name}! 👋
            </h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Punkte', value: me.totalPoints, color: 'var(--c-gold)' },
                { label: 'Platz', value: me.rank ?? '–', color: 'var(--c-text)' },
                { label: 'Tipps', value: me.tipCount, color: 'var(--c-muted)' },
              ].map((s) => (
                <div key={s.label} className="card" style={{ padding: '1rem 1.5rem', flex: '1 0 120px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: s.color, lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--c-hint)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Winner tip card (before tournament) */}
        {isWinnerOpen && (
          <div className="card fade-up" style={{ marginBottom: '2rem', border: '1px solid rgba(245,200,66,0.25)', background: 'rgba(245,200,66,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>🏆 Wer wird Weltmeister?</h4>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.82rem' }}>
                  Bis 11. Jun. 2026 · <span style={{ color: 'var(--c-gold)' }}>+5 Punkte</span> wenn richtig
                </p>
              </div>
              {winnerTip && (
                <span className="badge badge-gold">✓ {winnerTip.team.flagEmoji} {winnerTip.team.shortName}</span>
              )}
            </div>

            {teams.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  className="input"
                  style={{ maxWidth: '300px' }}
                  value={winnerTeamId}
                  onChange={(e) => setWinnerTeamId(e.target.value)}
                >
                  <option value="">– Team auswählen –</option>
                  {GROUPS.map((g) => (
                    <optgroup key={g} label={`Gruppe ${g}`}>
                      {(teamsByGroup[g] ?? []).map((t) => (
                        <option key={t.id} value={t.id}>{t.flagEmoji} {t.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button
                  className="btn btn-primary"
                  onClick={saveWinnerTip}
                  disabled={!winnerTeamId || savingWinner}
                >
                  {savingWinner ? 'Speichert...' : winnerTip ? '✓ Aktualisieren' : 'Tipp abgeben'}
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

          {/* Main: Match tips */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
              <h2>Gruppentipps</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--c-hint)' }}>
                {lastRefresh.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Tipp bis 5 Min. vor Anpfiff abgeben
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
              {GROUPS.map((g) => (
                <button key={g} onClick={() => setActiveGroup(g)} style={{
                  padding: '0.35rem 0.75rem', borderRadius: 'var(--r-sm)', border: '1px solid',
                  borderColor: activeGroup === g ? 'var(--c-gold)' : 'var(--c-border)',
                  background: activeGroup === g ? 'rgba(245,200,66,0.1)' : 'transparent',
                  color: activeGroup === g ? 'var(--c-gold)' : 'var(--c-muted)',
                  cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '1rem', transition: 'all 0.15s',
                }}>
                  {g}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {groupMatches.map((match) => {
                const tippable = isTippable(match)
                const tip = tips[match.id]
                const hasTip = tip && tip.home !== '' && tip.away !== ''
                const isLive = match.status === 'LIVE'

                return (
                  <div key={match.id} className={`match-card ${hasTip ? 'has-tip' : ''} ${!tippable && match.status === 'UPCOMING' ? 'locked' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>
                        {formatDate(match.kickoff)} · {match.venue}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {isLive && (
                          <span className="badge badge-red pulse">● LIVE</span>
                        )}
                        {match.status === 'FINISHED' && match.userTip?.points !== undefined && (
                          <span className={`badge ${match.userTip.points === 3 ? 'badge-gold' : match.userTip.points > 0 ? 'badge-green' : 'badge-muted'}`}>
                            +{match.userTip.points} Pkt
                          </span>
                        )}
                        {!tippable && match.status === 'UPCOMING' && (
                          <span className="badge badge-red">Gesperrt</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                      <div className="team-display">
                        <span className="team-flag">{match.homeTeam?.flagEmoji}</span>
                        <span className="team-name">{match.homeTeam?.shortName}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {match.status === 'FINISHED' ? (
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>
                            {match.homeGoals} : {match.awayGoals}
                          </span>
                        ) : isLive && match.homeGoals !== null ? (
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--c-red)' }}>
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

                      <div className="team-display">
                        <span className="team-flag">{match.awayTeam?.flagEmoji}</span>
                        <span className="team-name">{match.awayTeam?.shortName}</span>
                      </div>
                    </div>

                    {match.status !== 'FINISHED' && !isLive && match.userTip && (
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
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div className="card">
              <h4 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Rangliste</span>
                <Link href="/leaderboard" style={{ fontSize: '0.75rem', color: 'var(--c-gold)', textDecoration: 'none' }}>Alle →</Link>
              </h4>
              {leaderboard.length === 0 ? (
                <p style={{ color: 'var(--c-hint)', fontSize: '0.85rem' }}>Noch keine Tipps</p>
              ) : (
                leaderboard.map((u, i) => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0',
                    borderBottom: i < leaderboard.length - 1 ? '1px solid var(--c-border)' : 'none',
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', width: '24px', textAlign: 'center' }}
                      className={i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--c-hint)' }}>{u.classCode.toUpperCase()}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--c-gold)' }}>{u.totalPoints}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
