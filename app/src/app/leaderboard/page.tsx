'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeProvider'
import { PageBg } from '@/components/PageBg'

interface LeaderboardEntry {
  id: string
  name: string
  classCode: string
  totalPoints: number
  tipCount: number
  exactResults: number
  rank: number
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [filterClass, setFilterClass] = useState<string>('all')

  useEffect(() => {
    const url = filterClass !== 'all' ? `/api/leaderboard?class=${filterClass}` : '/api/leaderboard'
    fetch(url).then(r => r.json()).then(d => { if (Array.isArray(d)) setData(d) })
  }, [filterClass])

  const classes = ['all', '5a', '5b', '6a', '6b']

  return (
    <>
      <PageBg src="/bg-players.jpg" />
      <div className="page-content">
      <nav className="nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: '60px', gap: '1rem' }}>
          <Link href="/dashboard" style={{ color: 'var(--c-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>← Dashboard</Link>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--c-gold)', flex: 1 }}>⚽ WM 2026</span>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container relative" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--c-gold)', marginBottom: '0.5rem' }}>Rangliste</h1>
          <p style={{ color: 'var(--c-muted)' }}>Wer tippt am besten?</p>
        </div>

        {/* Top 3 podium */}
        {data.length >= 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', marginBottom: '3rem' }}>
            {/* 2nd */}
            <PodiumCard entry={data[1]} pos={2} />
            {/* 1st */}
            <PodiumCard entry={data[0]} pos={1} />
            {/* 3rd */}
            {data[2] && <PodiumCard entry={data[2]} pos={3} />}
          </div>
        )}

        {/* Class filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {classes.map(c => (
            <button key={c} onClick={() => setFilterClass(c)} style={{
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--r-sm)',
              border: '1px solid',
              borderColor: filterClass === c ? 'var(--c-gold)' : 'var(--c-border)',
              background: filterClass === c ? 'rgba(245,200,66,0.1)' : 'transparent',
              color: filterClass === c ? 'var(--c-gold)' : 'var(--c-muted)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}>
              {c === 'all' ? 'Alle Klassen' : `Klasse ${c.toUpperCase()}`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Name</th>
                <th>Klasse</th>
                <th style={{ textAlign: 'right' }}>Tipps</th>
                <th style={{ textAlign: 'right' }}>Exakt</th>
                <th style={{ textAlign: 'right' }}>Punkte</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}
                      className={u.rank === 1 ? 'rank-1' : u.rank === 2 ? 'rank-2' : u.rank === 3 ? 'rank-3' : ''}
                    >
                      {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : u.rank}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td><span className="badge badge-muted">{u.classCode.toUpperCase()}</span></td>
                  <td style={{ textAlign: 'right', color: 'var(--c-muted)' }}>{u.tipCount}</td>
                  <td style={{ textAlign: 'right', color: 'var(--c-gold)' }}>{u.exactResults}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--c-gold)' }}>
                    {u.totalPoints}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--c-hint)', padding: '2rem' }}>Noch keine Einträge</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Points legend */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Punktesystem</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {[
              { pts: 3, label: 'Exaktes Ergebnis', cls: 'badge-gold' },
              { pts: 2, label: 'Tordifferenz',     cls: 'badge-green' },
              { pts: 1, label: 'Tendenz',           cls: 'badge-blue' },
              { pts: 5, label: 'Turniersieger',     cls: 'badge-gold' },
            ].map(r => (
              <div key={r.pts} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${r.cls}`}>+{r.pts}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--c-muted)' }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

function PodiumCard({ entry, pos }: { entry: LeaderboardEntry; pos: number }) {
  const heights = { 1: '120px', 2: '90px', 3: '70px' }
  const colors = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' }
  const h = heights[pos as keyof typeof heights]
  const c = colors[pos as keyof typeof colors]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '100px' }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: c }}>{entry.name}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--c-hint)' }}>{entry.classCode.toUpperCase()}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: c }}>{entry.totalPoints}</div>
      <div style={{
        width: '80px',
        height: h,
        background: `${c}20`,
        border: `2px solid ${c}40`,
        borderRadius: 'var(--r-sm) var(--r-sm) 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        color: c,
      }}>
        {pos}
      </div>
    </div>
  )
}
