'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Match {
  id: string
  matchNumber: number
  phase: string
  group?: string
  homeTeam?: { name: string; shortName: string; flagEmoji: string }
  awayTeam?: { name: string; shortName: string; flagEmoji: string }
  kickoff: string
  status: string
  homeGoals?: number
  awayGoals?: number
}

interface User { id: string; name: string; classCode: string; loginCode: string }

export default function AdminPage() {
  const [tab, setTab] = useState<'results' | 'users' | 'leaderboard'>('results')
  const [matches, setMatches] = useState<Match[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [results, setResults] = useState<Record<string, { home: string; away: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  // New user form
  const [newName, setNewName] = useState('')
  const [newClass, setNewClass] = useState('6a')
  const [createdCode, setCreatedCode] = useState('')

  useEffect(() => {
    if (tab === 'results') {
      fetch('/api/matches?phase=GROUP').then(r => r.json()).then(d => {
        if (Array.isArray(d)) setMatches(d)
      })
    } else if (tab === 'users') {
      fetch('/api/admin').then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d) })
    } else {
      fetch('/api/leaderboard').then(r => r.json()).then(d => { if (Array.isArray(d)) setLeaderboard(d) })
    }
  }, [tab])

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
      setMsg('Ergebnis gespeichert und Punkte berechnet!')
      setMatches(prev => prev.map(m => m.id === matchId
        ? { ...m, status: 'FINISHED', homeGoals: Number(r.home), awayGoals: Number(r.away) }
        : m
      ))
      setTimeout(() => setMsg(''), 3000)
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
      setUsers(prev => [...prev, data.user])
    } else {
      setMsg(data.error)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const tabStyle = (t: string) => ({
    padding: '0.5rem 1.25rem',
    background: tab === t ? 'rgba(245,200,66,0.1)' : 'transparent',
    border: '1px solid',
    borderColor: tab === t ? 'var(--c-gold)' : 'var(--c-border)',
    color: tab === t ? 'var(--c-gold)' : 'var(--c-muted)',
    borderRadius: 'var(--r-sm)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    fontWeight: 500,
  })

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: '60px', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--c-gold)' }}>⚽ Admin</span>
          <span className="badge badge-red" style={{ marginRight: 'auto' }}>Nur für Admins</span>
          <a href="/api/auth/logout" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Abmelden</a>
        </div>
      </nav>

      <div className="container relative" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Admin-Panel</h2>

        {msg && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--r-sm)', marginBottom: '1rem',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--c-green)',
          }}>{msg}</div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button style={tabStyle('results')} onClick={() => setTab('results')}>Ergebnisse eintragen</button>
          <button style={tabStyle('users')} onClick={() => setTab('users')}>Schüler verwalten</button>
          <button style={tabStyle('leaderboard')} onClick={() => setTab('leaderboard')}>Gesamtrangliste</button>
        </div>

        {/* Results tab */}
        {tab === 'results' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Nur abgeschlossene Spiele eintragen. Punkte werden automatisch berechnet.
            </p>
            {matches.filter(m => m.status !== 'FINISHED').slice(0, 20).map(match => (
              <div key={match.id} className="match-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--c-muted)', marginBottom: '0.5rem' }}>
                  Spiel #{match.matchNumber} · Gruppe {match.group} ·{' '}
                  {new Date(match.kickoff).toLocaleDateString('de-DE')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                  <span style={{ minWidth: '80px', textAlign: 'right', fontSize: '0.9rem' }}>
                    {match.homeTeam?.flagEmoji} {match.homeTeam?.shortName}
                  </span>
                  <input type="number" className="score-input" min="0" max="20" placeholder="–"
                    value={results[match.id]?.home ?? ''}
                    onChange={e => setResults(prev => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))} />
                  <span className="vs">:</span>
                  <input type="number" className="score-input" min="0" max="20" placeholder="–"
                    value={results[match.id]?.away ?? ''}
                    onChange={e => setResults(prev => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))} />
                  <span style={{ minWidth: '80px', fontSize: '0.9rem' }}>
                    {match.awayTeam?.shortName} {match.awayTeam?.flagEmoji}
                  </span>
                </div>
                <button className="btn btn-primary"
                  onClick={() => saveResult(match.id)}
                  disabled={saving === match.id}
                  style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}>
                  {saving === match.id ? 'Speichert...' : 'Ergebnis eintragen & Punkte vergeben'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Neuen Schüler anlegen</h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--c-muted)', display: 'block', marginBottom: '4px' }}>Nachname</label>
                  <input className="input" value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="z.B. Müller" onKeyDown={e => e.key === 'Enter' && createUser()} />
                </div>
                <div style={{ flex: '0 0 120px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--c-muted)', display: 'block', marginBottom: '4px' }}>Klasse</label>
                  <select className="input" value={newClass} onChange={e => setNewClass(e.target.value)}>
                    {['5a','5b','6a','6b'].map(c => <option key={c} value={c}>{c}</option>)}
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
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead><tr><th>Name</th><th>Klasse</th><th>Login-Code</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td><span className="badge badge-muted">{u.classCode.toUpperCase()}</span></td>
                      <td><code style={{ color: 'var(--c-gold)', fontSize: '0.9rem' }}>{u.loginCode}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leaderboard tab */}
        {tab === 'leaderboard' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead><tr><th>#</th><th>Name</th><th>Klasse</th><th style={{ textAlign:'right' }}>Tipps</th><th style={{ textAlign:'right' }}>Exakt</th><th style={{ textAlign:'right' }}>Punkte</th></tr></thead>
              <tbody>
                {leaderboard.map(u => (
                  <tr key={u.id}>
                    <td><span className={u.rank <= 3 ? `rank-${u.rank}` : ''} style={{ fontFamily: 'var(--font-display)' }}>{u.rank}</span></td>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td><span className="badge badge-muted">{u.classCode.toUpperCase()}</span></td>
                    <td style={{ textAlign:'right', color: 'var(--c-muted)' }}>{u.tipCount}</td>
                    <td style={{ textAlign:'right', color: 'var(--c-gold)' }}>{u.exactResults}</td>
                    <td style={{ textAlign:'right', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--c-gold)' }}>{u.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
