'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Team { name: string; shortName: string; flagEmoji: string }
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

export default function DashboardPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [tips, setTips] = useState<Record<string, { home: string; away: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [activeGroup, setActiveGroup] = useState<string>('A')
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/matches?phase=GROUP').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setMatches(data)
        // Pre-fill existing tips
        const prefilled: Record<string, { home: string; away: string }> = {}
        data.forEach((m: Match) => {
          if (m.userTip) {
            prefilled[m.id] = { home: String(m.userTip.homeGoals), away: String(m.userTip.awayGoals) }
          }
        })
        setTips(prefilled)
      }
    })
    fetch('/api/leaderboard').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setLeaderboard(data.slice(0, 10))
    })
  }, [])

  const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']
  const groupMatches = matches.filter(m => m.group === activeGroup)

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
      setSaved(prev => ({ ...prev, [matchId]: true }))
      setTimeout(() => setSaved(prev => ({ ...prev, [matchId]: false })), 2000)
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--c-gold)' }}>
            ⚽ WM 2026
          </span>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/leaderboard" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Rangliste
            </Link>
            <a href="/api/auth/logout" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Abmelden
            </a>
          </div>
        </div>
      </nav>

      <div className="container relative" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>

          {/* Main: Match tips */}
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Gruppentipps</h2>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Tipp bis 5 Min. vor Anpfiff abgeben
            </p>

            {/* Group tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
              {groups.map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid',
                    borderColor: activeGroup === g ? 'var(--c-gold)' : 'var(--c-border)',
                    background: activeGroup === g ? 'rgba(245,200,66,0.1)' : 'transparent',
                    color: activeGroup === g ? 'var(--c-gold)' : 'var(--c-muted)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    transition: 'all 0.15s',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {groupMatches.map(match => {
                const tippable = isTippable(match)
                const tip = tips[match.id]
                const hasTip = tip && tip.home !== '' && tip.away !== ''

                return (
                  <div
                    key={match.id}
                    className={`match-card ${hasTip ? 'has-tip' : ''} ${!tippable ? 'locked' : ''}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>
                        {formatDate(match.kickoff)} · {match.venue}
                      </span>
                      {match.status === 'FINISHED' && match.userTip?.points !== undefined && (
                        <span className={`badge ${match.userTip.points === 3 ? 'badge-gold' : match.userTip.points > 0 ? 'badge-green' : 'badge-muted'}`}>
                          +{match.userTip.points} Pkt
                        </span>
                      )}
                      {!tippable && match.status === 'UPCOMING' && (
                        <span className="badge badge-red">Gesperrt</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                      {/* Home team */}
                      <div className="team-display">
                        <span className="team-flag">{match.homeTeam?.flagEmoji}</span>
                        <span className="team-name">{match.homeTeam?.shortName}</span>
                      </div>

                      {/* Score / input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {match.status === 'FINISHED' ? (
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--c-text)' }}>
                            {match.homeGoals} : {match.awayGoals}
                          </span>
                        ) : (
                          <>
                            <input
                              type="number"
                              className="score-input"
                              min="0" max="20"
                              placeholder="–"
                              value={tip?.home ?? ''}
                              disabled={!tippable}
                              onChange={e => setTips(prev => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))}
                            />
                            <span className="vs">:</span>
                            <input
                              type="number"
                              className="score-input"
                              min="0" max="20"
                              placeholder="–"
                              value={tip?.away ?? ''}
                              disabled={!tippable}
                              onChange={e => setTips(prev => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))}
                            />
                          </>
                        )}
                      </div>

                      {/* Away team */}
                      <div className="team-display">
                        <span className="team-flag">{match.awayTeam?.flagEmoji}</span>
                        <span className="team-name">{match.awayTeam?.shortName}</span>
                      </div>
                    </div>

                    {/* Tip exists: show it */}
                    {match.status !== 'FINISHED' && match.userTip && (
                      <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--c-muted)' }}>
                        Dein Tipp: {match.userTip.homeGoals} : {match.userTip.awayGoals}
                      </div>
                    )}

                    {tippable && (
                      <button
                        className="btn btn-primary"
                        onClick={() => saveTip(match.id)}
                        disabled={!hasTip || saving === match.id}
                        style={{
                          width: '100%',
                          marginTop: '0.75rem',
                          justifyContent: 'center',
                          background: saved[match.id] ? 'var(--c-green)' : undefined,
                          color: saved[match.id] ? '#fff' : undefined,
                        }}
                      >
                        {saving === match.id ? 'Speichern...' : saved[match.id] ? '✓ Gespeichert' : 'Tipp abgeben'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar: Mini leaderboard */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div className="card">
              <h4 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Rangliste</span>
                <Link href="/leaderboard" style={{ fontSize: '0.75rem', color: 'var(--c-gold)', textDecoration: 'none' }}>
                  Alle →
                </Link>
              </h4>
              {leaderboard.length === 0 ? (
                <p style={{ color: 'var(--c-hint)', fontSize: '0.85rem' }}>Noch keine Tipps</p>
              ) : (
                leaderboard.map((u, i) => (
                  <div key={u.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0',
                    borderBottom: i < leaderboard.length - 1 ? '1px solid var(--c-border)' : 'none',
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', width: '24px', textAlign: 'center' }}
                      className={i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}
                    >
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
    </div>
  )
}
