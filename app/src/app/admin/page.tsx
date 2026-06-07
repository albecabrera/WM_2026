'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Match {
  id: string; matchNumber: number; phase: string; group?: string; round?: string
  homeTeam?: { id: string; name: string; shortName: string; flagEmoji: string } | null
  awayTeam?: { id: string; name: string; shortName: string; flagEmoji: string } | null
  kickoff: string; status: string; homeGoals?: number | null; awayGoals?: number | null
}
interface User { id: string; name: string; classCode: string; loginCode: string }
interface Team { id: string; name: string; shortName: string; flagEmoji: string; group?: string }

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
const ROUND_LABELS: Record<string, string> = {
  R32: 'Runde der 32', R16: 'Achtelfinale', QF: 'Viertelfinale',
  SF: 'Halbfinale', '3RD': '3. Platz', FINAL: 'Finale',
}
const ROUND_ORDER = ['R32', 'R16', 'QF', 'SF', '3RD', 'FINAL']

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'results' | 'ko' | 'winner' | 'users' | 'leaderboard'>('results')
  const [matches, setMatches] = useState<Match[]>([])
  const [koMatches, setKoMatches] = useState<Match[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [results, setResults] = useState<Record<string, { home: string; away: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState({ text: '', ok: true })
  const [newName, setNewName] = useState('')
  const [newClass, setNewClass] = useState('6a')
  const [createdCode, setCreatedCode] = useState('')
  const [winnerTeamId, setWinnerTeamId] = useState('')
  const [revealDone, setRevealDone] = useState(false)
  const [filterClass, setFilterClass] = useState('all')
  const [koTeams, setKoTeams] = useState<Record<string, { home: string; away: string }>>({})
  const [activeKoRound, setActiveKoRound] = useState('R32')
  const [printMode, setPrintMode] = useState(false)

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok })
    setTimeout(() => setMsg({ text: '', ok: true }), 4000)
  }

  const fetchTeams = useCallback(async () => {
    const d = await fetch('/api/teams').then((r) => r.json())
    if (Array.isArray(d)) setTeams(d)
  }, [])

  useEffect(() => { fetchTeams() }, [fetchTeams])

  useEffect(() => {
    if (tab === 'results') {
      fetch('/api/matches?phase=GROUP').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setMatches(d) })
    } else if (tab === 'ko') {
      fetch('/api/admin/ko').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setKoMatches(d) })
    } else if (tab === 'users') {
      fetch('/api/admin').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setUsers(d) })
    } else if (tab === 'leaderboard') {
      const url = filterClass !== 'all' ? `/api/leaderboard?class=${filterClass}` : '/api/leaderboard'
      fetch(url).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setLeaderboard(d) })
    }
  }, [tab, filterClass])

  async function saveResult(matchId: string) {
    const r = results[matchId]
    if (!r || r.home === '' || r.away === '') return
    setSaving(matchId)
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, homeGoals: Number(r.home), awayGoals: Number(r.away) }),
    })
    setSaving(null)
    if (res.ok) {
      showMsg('Ergebnis gespeichert und Punkte berechnet!')
      setMatches((prev) => prev.map((m) =>
        m.id === matchId ? { ...m, status: 'FINISHED', homeGoals: Number(r.home), awayGoals: Number(r.away) } : m
      ))
      setKoMatches((prev) => prev.map((m) =>
        m.id === matchId ? { ...m, status: 'FINISHED', homeGoals: Number(r.home), awayGoals: Number(r.away) } : m
      ))
    }
  }

  async function assignKoTeam(matchId: string, slot: 'home' | 'away', teamId: string) {
    const res = await fetch('/api/admin/ko', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, [slot === 'home' ? 'homeTeamId' : 'awayTeamId']: teamId || null }),
    })
    if (res.ok) {
      const updated = await res.json()
      setKoMatches((prev) => prev.map((m) => m.id === matchId ? updated : m))
      showMsg('Team zugewiesen')
    }
  }

  async function createUser() {
    if (!newName.trim()) return
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), classCode: newClass }),
    })
    const data = await res.json()
    if (res.ok) {
      setCreatedCode(data.loginCode)
      setNewName('')
      setUsers((prev) => [...prev, data.user])
    } else {
      showMsg(data.error, false)
    }
  }

  async function revealWinner() {
    if (!winnerTeamId) return
    const res = await fetch('/api/results/winner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: winnerTeamId }),
    })
    const data = await res.json()
    if (res.ok) {
      setRevealDone(true)
      showMsg(`🏆 ${data.winner.name} als Weltmeister bestätigt! ${data.tipsCorrect} von ${data.tipsTotal} Tipps richtig.`)
    }
  }

  function startCelebration() {
    const top = leaderboard.length > 0 ? leaderboard[0] : null
    if (!top) { fetchLeaderboard(); return }
    router.push(`/celebration?name=${encodeURIComponent(top.name)}&pts=${top.totalPoints}&class=${top.classCode}`)
  }

  function fetchLeaderboard() {
    const url = filterClass !== 'all' ? `/api/leaderboard?class=${filterClass}` : '/api/leaderboard'
    fetch(url).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setLeaderboard(d) })
  }

  const tabStyle = (t: string) => ({
    padding: '0.5rem 1.1rem', background: tab === t ? 'rgba(245,200,66,0.1)' : 'transparent',
    border: '1px solid', borderColor: tab === t ? 'var(--c-gold)' : 'var(--c-border)',
    color: tab === t ? 'var(--c-gold)' : 'var(--c-muted)', borderRadius: 'var(--r-sm)',
    cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500,
  })

  const teamsByGroup = teams.reduce<Record<string, Team[]>>((acc, t) => {
    const g = t.group ?? 'Z'
    if (!acc[g]) acc[g] = []
    acc[g].push(t)
    return acc
  }, {})

  const koByRound = koMatches.reduce<Record<string, Match[]>>((acc, m) => {
    const r = m.round ?? 'R32'
    if (!acc[r]) acc[r] = []
    acc[r].push(m)
    return acc
  }, {})

  const pendingGroupMatches = matches.filter((m) => m.status !== 'FINISHED')

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: '60px', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--c-gold)' }}>⚽ Admin</span>
          <span className="badge badge-red" style={{ marginRight: 'auto' }}>Nur für Admins</span>
          <button onClick={() => { fetchLeaderboard(); startCelebration() }} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
            🎉 Feier starten
          </button>
          <a href="/api/auth/logout" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Abmelden</a>
        </div>
      </nav>

      <div className="container relative" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Admin-Panel</h2>

        {msg.text && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--r-sm)', marginBottom: '1rem',
            background: msg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${msg.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            color: msg.ok ? 'var(--c-green)' : 'var(--c-red)',
          }}>{msg.text}</div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button style={tabStyle('results')} onClick={() => setTab('results')}>Gruppen-Ergebnisse</button>
          <button style={tabStyle('ko')} onClick={() => setTab('ko')}>KO-Runden</button>
          <button style={tabStyle('winner')} onClick={() => setTab('winner')}>🏆 Turniersieger</button>
          <button style={tabStyle('users')} onClick={() => setTab('users')}>Schüler verwalten</button>
          <button style={tabStyle('leaderboard')} onClick={() => setTab('leaderboard')}>Gesamtrangliste</button>
        </div>

        {/* ── Gruppen-Ergebnisse ── */}
        {tab === 'results' && (
          <div>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {pendingGroupMatches.length} Spiele noch nicht eingetragen
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingGroupMatches.slice(0, 30).map((match) => (
                <div key={match.id} className="match-card">
                  <div style={{ fontSize: '0.75rem', color: 'var(--c-muted)', marginBottom: '0.5rem' }}>
                    Spiel #{match.matchNumber} · Gruppe {match.group} · {new Date(match.kickoff).toLocaleDateString('de-DE')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                    <span style={{ minWidth: '80px', textAlign: 'right', fontSize: '0.9rem' }}>
                      {match.homeTeam?.flagEmoji} {match.homeTeam?.shortName}
                    </span>
                    <input type="number" className="score-input" min="0" max="20" placeholder="–"
                      value={results[match.id]?.home ?? ''}
                      onChange={(e) => setResults((prev) => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))} />
                    <span className="vs">:</span>
                    <input type="number" className="score-input" min="0" max="20" placeholder="–"
                      value={results[match.id]?.away ?? ''}
                      onChange={(e) => setResults((prev) => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))} />
                    <span style={{ minWidth: '80px', fontSize: '0.9rem' }}>
                      {match.awayTeam?.shortName} {match.awayTeam?.flagEmoji}
                    </span>
                  </div>
                  <button className="btn btn-primary" onClick={() => saveResult(match.id)}
                    disabled={saving === match.id}
                    style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}>
                    {saving === match.id ? 'Speichert...' : 'Ergebnis eintragen & Punkte vergeben'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── KO-Runden ── */}
        {tab === 'ko' && (
          <div>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Zuerst Teams zuweisen, dann Ergebnisse eintragen.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {ROUND_ORDER.map((r) => (
                <button key={r} onClick={() => setActiveKoRound(r)} style={{
                  ...tabStyle(r), borderColor: activeKoRound === r ? 'var(--c-gold)' : 'var(--c-border)',
                  background: activeKoRound === r ? 'rgba(245,200,66,0.1)' : 'transparent',
                  color: activeKoRound === r ? 'var(--c-gold)' : 'var(--c-muted)',
                }}>
                  {ROUND_LABELS[r] ?? r}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(koByRound[activeKoRound] ?? []).map((match) => (
                <div key={match.id} className="match-card">
                  <div style={{ fontSize: '0.75rem', color: 'var(--c-muted)', marginBottom: '0.75rem' }}>
                    Spiel #{match.matchNumber} · {ROUND_LABELS[match.round ?? ''] ?? match.round} · {new Date(match.kickoff).toLocaleDateString('de-DE')}
                  </div>

                  {/* Team assignment */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <select className="input" style={{ fontSize: '0.85rem' }}
                      value={match.homeTeam?.id ?? koTeams[match.id]?.home ?? ''}
                      onChange={(e) => {
                        setKoTeams((prev) => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))
                        assignKoTeam(match.id, 'home', e.target.value)
                      }}>
                      <option value="">– Heim –</option>
                      {GROUPS.map((g) => (
                        <optgroup key={g} label={`Gruppe ${g}`}>
                          {(teamsByGroup[g] ?? []).map((t) => (
                            <option key={t.id} value={t.id}>{t.flagEmoji} {t.shortName}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>

                    <div style={{ textAlign: 'center' }}>
                      {match.status === 'FINISHED' ? (
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                          {match.homeGoals} : {match.awayGoals}
                        </span>
                      ) : (
                        <span className="vs" style={{ fontSize: '1.2rem' }}>vs</span>
                      )}
                    </div>

                    <select className="input" style={{ fontSize: '0.85rem' }}
                      value={match.awayTeam?.id ?? koTeams[match.id]?.away ?? ''}
                      onChange={(e) => {
                        setKoTeams((prev) => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))
                        assignKoTeam(match.id, 'away', e.target.value)
                      }}>
                      <option value="">– Auswärts –</option>
                      {GROUPS.map((g) => (
                        <optgroup key={g} label={`Gruppe ${g}`}>
                          {(teamsByGroup[g] ?? []).map((t) => (
                            <option key={t.id} value={t.id}>{t.flagEmoji} {t.shortName}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Result entry (only if teams assigned and not finished) */}
                  {match.homeTeam && match.awayTeam && match.status !== 'FINISHED' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                      <input type="number" className="score-input" min="0" max="20" placeholder="–"
                        value={results[match.id]?.home ?? ''}
                        onChange={(e) => setResults((prev) => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))} />
                      <span className="vs">:</span>
                      <input type="number" className="score-input" min="0" max="20" placeholder="–"
                        value={results[match.id]?.away ?? ''}
                        onChange={(e) => setResults((prev) => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))} />
                      <button className="btn btn-primary" onClick={() => saveResult(match.id)}
                        disabled={saving === match.id} style={{ fontSize: '0.85rem' }}>
                        {saving === match.id ? '...' : 'Eintragen'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {!(koByRound[activeKoRound]?.length) && (
                <div className="card" style={{ textAlign: 'center', color: 'var(--c-hint)', padding: '2rem' }}>
                  Keine Spiele für diese Runde
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Turniersieger ── */}
        {tab === 'winner' && (
          <div>
            <div className="card" style={{ maxWidth: '500px', border: '1px solid rgba(245,200,66,0.25)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>🏆 Weltmeister bekannt geben</h4>
              <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Sobald der Weltmeister feststeht, hier bestätigen. Alle Schüler mit richtigem Tipp erhalten +5 Punkte.
              </p>

              <label style={{ fontSize: '0.8rem', color: 'var(--c-muted)', display: 'block', marginBottom: '6px' }}>
                Weltmeister
              </label>
              <select className="input" style={{ marginBottom: '1rem' }}
                value={winnerTeamId} onChange={(e) => setWinnerTeamId(e.target.value)}>
                <option value="">– Team auswählen –</option>
                {GROUPS.map((g) => (
                  <optgroup key={g} label={`Gruppe ${g}`}>
                    {(teamsByGroup[g] ?? []).map((t) => (
                      <option key={t.id} value={t.id}>{t.flagEmoji} {t.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <button className="btn btn-primary" onClick={revealWinner} disabled={!winnerTeamId || revealDone}
                style={{ width: '100%', justifyContent: 'center' }}>
                {revealDone ? '✓ Weltmeister bestätigt' : '🏆 Weltmeister bestätigen & Punkte vergeben'}
              </button>
            </div>

            <div className="card" style={{ maxWidth: '500px', marginTop: '1.5rem', border: '1px solid rgba(245,200,66,0.15)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>🎉 Siegerehrung</h4>
              <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Öffnet die Feier-Seite mit dem Tipp-Spiel-Gewinner (Schüler mit meisten Punkten).
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['all', '5a', '5b', '6a', '6b'].map((c) => (
                  <button key={c} onClick={() => setFilterClass(c)} style={{
                    ...tabStyle(c),
                    borderColor: filterClass === c ? 'var(--c-gold)' : 'var(--c-border)',
                    background: filterClass === c ? 'rgba(245,200,66,0.1)' : 'transparent',
                    color: filterClass === c ? 'var(--c-gold)' : 'var(--c-muted)',
                  }}>
                    {c === 'all' ? 'Alle' : `Klasse ${c.toUpperCase()}`}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" onClick={startCelebration} style={{ marginTop: '1rem', justifyContent: 'center', width: '100%' }}>
                🎉 Feier starten
              </button>
            </div>
          </div>
        )}

        {/* ── Schüler verwalten ── */}
        {tab === 'users' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Neuen Schüler anlegen</h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--c-muted)', display: 'block', marginBottom: '4px' }}>Nachname</label>
                  <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)}
                    placeholder="z.B. Müller" onKeyDown={(e) => e.key === 'Enter' && createUser()} />
                </div>
                <div style={{ flex: '0 0 120px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--c-muted)', display: 'block', marginBottom: '4px' }}>Klasse</label>
                  <select className="input" value={newClass} onChange={(e) => setNewClass(e.target.value)}>
                    {['5a', '5b', '6a', '6b'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={createUser}>Anlegen</button>
              </div>
              {createdCode && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(34,197,94,0.1)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <span style={{ color: 'var(--c-muted)', fontSize: '0.85rem' }}>Login-Code: </span>
                  <code style={{ color: 'var(--c-gold)', fontSize: '1rem', fontWeight: 700 }}>{createdCode}</code>
                </div>
              )}
            </div>

            {/* Print/QR view */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4>Alle Schüler ({users.length})</h4>
              <button className="btn btn-ghost" onClick={() => window.print()} style={{ fontSize: '0.82rem' }}>
                🖨 Codes drucken
              </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead><tr><th>Name</th><th>Klasse</th><th>Login-Code</th><th>QR</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td><span className="badge badge-muted">{u.classCode.toUpperCase()}</span></td>
                      <td><code style={{ color: 'var(--c-gold)', fontSize: '0.9rem' }}>{u.loginCode}</code></td>
                      <td>
                        <img src={`/api/admin/qr?code=${u.loginCode}`} alt={`QR ${u.loginCode}`}
                          style={{ width: '48px', height: '48px', borderRadius: '4px' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Gesamtrangliste ── */}
        {tab === 'leaderboard' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {['all', '5a', '5b', '6a', '6b'].map((c) => (
                <button key={c} onClick={() => setFilterClass(c)} style={{
                  ...tabStyle(c),
                  borderColor: filterClass === c ? 'var(--c-gold)' : 'var(--c-border)',
                  background: filterClass === c ? 'rgba(245,200,66,0.1)' : 'transparent',
                  color: filterClass === c ? 'var(--c-gold)' : 'var(--c-muted)',
                }}>
                  {c === 'all' ? 'Alle Klassen' : `Klasse ${c.toUpperCase()}`}
                </button>
              ))}
              <button className="btn btn-ghost" onClick={fetchLeaderboard} style={{ marginLeft: 'auto', fontSize: '0.82rem' }}>
                ↻ Aktualisieren
              </button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Klasse</th>
                    <th style={{ textAlign: 'right' }}>Tipps</th>
                    <th style={{ textAlign: 'right' }}>Exakt</th>
                    <th style={{ textAlign: 'right' }}>Punkte</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <span className={u.rank <= 3 ? `rank-${u.rank}` : ''} style={{ fontFamily: 'var(--font-display)' }}>
                          {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : u.rank}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td><span className="badge badge-muted">{u.classCode.toUpperCase()}</span></td>
                      <td style={{ textAlign: 'right', color: 'var(--c-muted)' }}>{u.tipCount}</td>
                      <td style={{ textAlign: 'right', color: 'var(--c-gold)' }}>{u.exactResults}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--c-gold)' }}>{u.totalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .nav, button, .btn { display: none !important; }
          body { background: white; color: black; }
          .table td, .table th { border: 1px solid #ccc; color: black; }
          code { color: #333 !important; }
          img { border: 1px solid #ccc; }
        }
      `}</style>
    </div>
  )
}
