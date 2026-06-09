'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeProvider'
import { PageBg } from '@/components/PageBg'
import { classLabel } from '@/lib/classes'

function deFormat(d: string) {
  return new Date(d).toLocaleString('de-DE', {
    timeZone: 'Europe/Berlin',
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}
function deTime(d: string) {
  return new Date(d).toLocaleTimeString('de-DE', {
    timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit',
  })
}

function TutorialModal({ onClose }: { onClose: () => void }) {
  const lineStyle = { margin: 0, marginBottom: '0.5rem', lineHeight: 1.5 }
  const steps = [
    {
      icon: '⚽',
      title: 'So tippst du',
      text: (
        <>
          <p style={lineStyle}>Bei jedem Spiel gibt es zwei Felder.</p>
          <p style={lineStyle}><strong>Links:</strong> Tore vom Heim-Team.</p>
          <p style={lineStyle}><strong>Rechts:</strong> Tore vom Gast-Team.</p>
          <p style={{ ...lineStyle, color: '#f5c842' }}>Beispiel: 2 und 1 = 2:1 ⚽</p>
        </>
      ),
    },
    {
      icon: '✅',
      title: 'Tipp speichern',
      text: (
        <>
          <p style={lineStyle}>Tippe deine Zahlen ein.</p>
          <p style={lineStyle}>Klicke den gelben Knopf <strong>„Tipp abgeben"</strong>.</p>
          <p style={{ ...lineStyle, color: '#22c55e' }}>Wird er grün mit „✓ Gespeichert" — fertig! 🎉</p>
        </>
      ),
    },
    {
      icon: '⏰',
      title: 'Nicht zu spät!',
      text: (
        <>
          <p style={lineStyle}>Tippe bis <strong>5 Minuten vor</strong> dem Spiel.</p>
          <p style={lineStyle}>Danach ist das Feld <strong>gesperrt</strong>.</p>
          <p style={{ ...lineStyle, color: '#f5c842' }}>Also: lieber früh tippen! ⏰</p>
        </>
      ),
    },
    {
      icon: '🏆',
      title: 'Punkte sammeln',
      text: (
        <>
          <p style={{ margin: 0, marginBottom: '0.5rem' }}>So bekommst du Punkte:</p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.8' }}>
            <li><strong style={{ color: '#f5c842' }}>+3</strong> — genaues Ergebnis (z.B. 2:1 = 2:1)</li>
            <li><strong style={{ color: '#22c55e' }}>+2</strong> — Tordifferenz stimmt (z.B. 3:2 statt 2:1)</li>
            <li><strong style={{ color: '#94a3b8' }}>+1</strong> — richtiger Sieger oder Unentschieden</li>
          </ul>
        </>
      ),
    },
    {
      icon: '🌍',
      title: 'Wer wird Weltmeister?',
      text: (
        <>
          <p style={lineStyle}>Tippe vor dem Turnier: Wer gewinnt die WM?</p>
          <p style={{ ...lineStyle, color: '#f5c842' }}>Richtig = +5 Punkte! 🏆</p>
          <p style={lineStyle}>Den Tipp findest du oben auf der Seite.</p>
        </>
      ),
    },
  ]

  const [step, setStep] = useState(0)
  const isLast = step === steps.length - 1
  const current = steps[step]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#0f1623',
        border: '1px solid rgba(245,200,66,0.25)',
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        position: 'relative',
      }}>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === step ? '#f5c842' : i < step ? '#f5c84260' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{ textAlign: 'center', fontSize: '3.5rem', marginBottom: '1rem', lineHeight: 1 }}>
          {current.icon}
        </div>

        {/* Title */}
        <h3 style={{
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          color: '#f5c842',
          marginBottom: '1rem',
          lineHeight: 1.2,
        }}>
          {current.title}
        </h3>

        {/* Text */}
        <div style={{
          color: '#94a3b8',
          fontSize: '0.95rem',
          lineHeight: '1.65',
          textAlign: typeof current.text === 'string' ? 'center' : 'left',
          minHeight: '100px',
        }}>
          {current.text}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              flex: 1, padding: '0.75rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px', color: '#94a3b8',
              cursor: 'pointer', fontSize: '0.9rem',
            }}>
              ← Zurück
            </button>
          )}
          <button onClick={isLast ? onClose : () => setStep(s => s + 1)} style={{
            flex: 2, padding: '0.75rem',
            background: '#f5c842', border: 'none',
            borderRadius: '10px',
            color: '#0a0e1a', fontWeight: 700,
            cursor: 'pointer', fontSize: '0.95rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.04em',
          }}>
            {isLast ? '🚀 Los geht\'s!' : 'Weiter →'}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button onClick={onClose} style={{
            display: 'block', width: '100%', marginTop: '0.75rem',
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.25)', cursor: 'pointer',
            fontSize: '0.78rem', textAlign: 'center',
          }}>
            Überspringen
          </button>
        )}
      </div>
    </div>
  )
}

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
  name: string; classCode: string; role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  totalPoints: number; tipCount: number; rank: number | null
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
  const [showTutorial, setShowTutorial] = useState(false)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default')
  const [notifDismissed, setNotifDismissed] = useState(false)
  const [teacherWelcomeDismissed, setTeacherWelcomeDismissed] = useState(false)
  const prevMatchesRef = useRef<Match[]>([])
  const scheduledRef = useRef<Set<string>>(new Set())

  const isWinnerOpen = new Date() < TOURNAMENT_START

  useEffect(() => {
    const seen = localStorage.getItem('wm2026_tutorial_seen')
    if (!seen) setShowTutorial(true)
  }, [])

  function closeTutorial() {
    localStorage.setItem('wm2026_tutorial_seen', '1')
    setShowTutorial(false)
  }

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

  // Auto-sync con internet al abrir (throttled en el servidor). El maestro no hace nada.
  useEffect(() => {
    fetch('/api/sync').then((r) => r.json()).then((d) => {
      if (d?.ok && !d.skipped) { fetchMatches(); fetchLeaderboard() }
    }).catch(() => {})
  }, [fetchMatches, fetchLeaderboard])

  // Read current notification permission on mount
  useEffect(() => {
    if ('Notification' in window) setNotifPermission(Notification.permission)
  }, [])

  // Schedule browser notifications for upcoming untipped matches (2h + 30min before)
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const now = Date.now()
    const timers: ReturnType<typeof setTimeout>[] = []

    matches.forEach((m) => {
      if (m.status !== 'UPCOMING') return
      const tip = tips[m.id]
      const hasTip = (tip && tip.home !== '' && tip.away !== '') || m.userTip
      if (hasTip) return

      const kickoff = new Date(m.kickoff).getTime()
      const label = `${m.homeTeam?.flagEmoji ?? ''} ${m.homeTeam?.shortName} vs. ${m.awayTeam?.shortName} ${m.awayTeam?.flagEmoji ?? ''}`
      const zeitDE = deTime(m.kickoff)

      const schedule = (msFromNow: number, title: string, body: string) => {
        const key = `${m.id}-${msFromNow}`
        if (msFromNow < 0 || scheduledRef.current.has(key)) return
        scheduledRef.current.add(key)
        timers.push(setTimeout(() => {
          new Notification(title, { body, icon: '/favicon.ico', tag: key })
        }, msFromNow))
      }

      schedule(kickoff - 2 * 3600_000 - now, '⚽ Tipp nicht vergessen!',
        `${label} beginnt um ${zeitDE} Uhr (DE-Zeit). Jetzt tippen!`)
      schedule(kickoff - 30 * 60_000 - now, '⚠️ Letzte Chance!',
        `${label} beginnt um ${zeitDE} Uhr — nur noch 30 Minuten!`)
      schedule(kickoff - 5 * 60_000 - now, '🔒 Tipp wird gleich gesperrt!',
        `${label} — noch 5 Minuten bis zur Sperrung!`)
    })

    return () => timers.forEach(clearTimeout)
  }, [matches, tips])

  const now = Date.now()
  const urgentUntipped = matches
    .filter((m) => {
      if (m.status !== 'UPCOMING') return false
      const tip = tips[m.id]
      const hasTip = (tip && tip.home !== '' && tip.away !== '') || m.userTip
      if (hasTip) return false
      const ms = new Date(m.kickoff).getTime() - now
      return ms > 0 && ms < 48 * 3600_000
    })
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())

  function urgency(kickoff: string): { label: string; color: string; bg: string; border: string } {
    const ms = new Date(kickoff).getTime() - Date.now()
    if (ms < 2 * 3600_000)  return { label: 'Jetzt sofort!',    color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)' }
    if (ms < 24 * 3600_000) return { label: 'Heute noch!',      color: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.25)' }
    return                          { label: 'Nicht vergessen!', color: '#f5c842', bg: 'rgba(245,200,66,0.06)',  border: 'rgba(245,200,66,0.2)'  }
  }

  async function requestNotifPermission() {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setNotifPermission(result)
  }

  const groupMatches = matches.filter((m) => m.group === activeGroup)
  const tippedInGroup = groupMatches.filter((m) => {
    const t = tips[m.id]
    return (t && t.home !== '' && t.away !== '') || m.userTip
  }).length

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

  const formatDate = deFormat

  const teamsByGroup = teams.reduce<Record<string, Team[]>>((acc, t) => {
    const g = t.group ?? 'Z'
    if (!acc[g]) acc[g] = []
    acc[g].push(t)
    return acc
  }, {})

  return (
    <>
      <PageBg src="/bg-players.jpg" />
      <div className="page-content">

      {/* Tutorial modal */}
      {showTutorial && <TutorialModal onClose={closeTutorial} />}

      {/* ⏰ Sticky warning banner */}
      <div style={{
        background: 'rgba(245,200,66,0.08)',
        borderBottom: '1px solid rgba(245,200,66,0.2)',
        padding: '0.55rem 1rem',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: '#f5c842',
        letterSpacing: '0.02em',
        position: 'sticky',
        top: '60px',
        zIndex: 90,
        backdropFilter: 'blur(8px)',
      }}>
        ⏰ <strong>Wichtig:</strong> Alle Zeiten in <strong>deutscher Zeit (MEZ/MESZ)</strong> · Tipp bis <strong>5 Min. vor Anpfiff</strong> abgeben — danach gesperrt!
      </div>

      {/* 🔔 Notification permission banner */}
      {notifPermission === 'default' && !notifDismissed && (
        <div style={{
          background: 'rgba(59,130,246,0.08)',
          borderBottom: '1px solid rgba(59,130,246,0.2)',
          padding: '0.55rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem', flexWrap: 'wrap',
          fontSize: '0.82rem', color: 'var(--c-muted)',
        }}>
          <span>🔔 <strong>Browser-Benachrichtigungen</strong> aktivieren — damit du Spiele nicht verpasst!</span>
          <button onClick={requestNotifPermission} style={{
            background: '#3b82f6', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '0.3rem 0.8rem',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
          }}>Aktivieren</button>
          <button onClick={() => setNotifDismissed(true)} style={{
            background: 'none', border: 'none', color: 'var(--c-hint)',
            cursor: 'pointer', fontSize: '0.8rem',
          }}>Nicht jetzt</button>
        </div>
      )}
      {notifPermission === 'granted' && (
        <div style={{
          background: 'rgba(34,197,94,0.06)',
          borderBottom: '1px solid rgba(34,197,94,0.15)',
          padding: '0.4rem 1rem',
          textAlign: 'center', fontSize: '0.75rem', color: 'rgba(34,197,94,0.8)',
        }}>
          ✓ Benachrichtigungen aktiv — du wirst 2h und 30 Min. vor deinen Spielen erinnert
        </div>
      )}

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

      {/* 👩‍🏫 Teacher welcome banner */}
      {me?.role === 'TEACHER' && !teacherWelcomeDismissed && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--c-surface)',
            border: '1px solid rgba(245,200,66,0.3)',
            borderRadius: '16px',
            maxWidth: '420px', width: '100%',
            padding: '2rem',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👩‍🏫</div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '2rem',
              color: 'var(--c-gold)', marginBottom: '0.4rem', lineHeight: 1,
            }}>
              Willkommen, {me.name}!
            </h2>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Du bist als <strong style={{ color: 'var(--c-text)' }}>Lehrkraft</strong> eingeloggt.
              Du spielst mit und siehst alle Funktionen für deine Klasse.
            </p>
            <div style={{
              background: 'rgba(245,200,66,0.06)',
              border: '1px solid rgba(245,200,66,0.15)',
              borderRadius: '10px', padding: '1rem',
              marginBottom: '1.5rem', textAlign: 'left',
              fontSize: '0.82rem', color: 'var(--c-muted)', lineHeight: 1.7,
            }}>
              <div>📋 <strong>Klassenliste</strong> — Codes der Schüler ausdrucken</div>
              <div>⚙️ <strong>Verwaltung</strong> — Codes zurücksetzen</div>
              <div>📘 <strong>Handbuch</strong> — Anleitung für Lehrkräfte</div>
              <div>🔔 <strong>Benachrichtigungen</strong> — Spielerinnerungen aktivieren</div>
            </div>
            <button
              onClick={() => setTeacherWelcomeDismissed(true)}
              style={{
                background: 'var(--c-gold)', color: '#0a0e1a',
                border: 'none', borderRadius: '10px',
                padding: '0.8rem 2rem', fontSize: '1rem',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                cursor: 'pointer', width: '100%',
                letterSpacing: '0.04em',
              }}
            >
              Los geht&apos;s! →
            </button>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--c-gold)' }}>⚽ WM 2026</span>
          {me?.role === 'TEACHER' && (
            <span style={{
              fontSize: '0.8rem', color: 'var(--c-muted)',
              background: 'var(--c-surface)', border: '1px solid var(--c-border)',
              borderRadius: '6px', padding: '0.2rem 0.65rem',
              marginLeft: '0.25rem',
            }}>
              👩‍🏫 {me.name}
            </span>
          )}
          {urgentUntipped.length > 0 && (
            <span style={{
              background: '#ef4444', color: '#fff', borderRadius: '100px',
              fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.55rem',
              marginLeft: '0.5rem', verticalAlign: 'middle',
              animation: urgentUntipped.some(m => new Date(m.kickoff).getTime() - Date.now() < 2 * 3600_000) ? 'pulse 1.5s infinite' : 'none',
            }}>
              {urgentUntipped.length} offen
            </span>
          )}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link href="/dashboard/ko" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>KO-Runden</Link>
            <Link href="/leaderboard" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Rangliste</Link>
            {me && (me.role === 'TEACHER' || me.role === 'ADMIN') && (
              <>
                <Link href="/admin" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>⚙ Verwaltung</Link>
                <Link href="/klassenliste" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>📋 Klassenliste</Link>
              </>
            )}
            <button
              onClick={() => setShowTutorial(true)}
              title="Spielanleitung anzeigen"
              style={{
                background: 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.3)',
                borderRadius: '50%', width: '32px', height: '32px',
                color: '#f5c842', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >?</button>
            <ThemeToggle />
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

        {/* 🚨 Offene Tipps — urgente untipped matches */}
        {urgentUntipped.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>🚨</span>
              <span>Offene Tipps — nächste 48 Stunden</span>
              <span style={{
                background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '100px', padding: '0.1rem 0.55rem',
                fontSize: '0.75rem', fontWeight: 700, marginLeft: '4px',
              }}>{urgentUntipped.length}</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {urgentUntipped.map((m) => {
                const u = urgency(m.kickoff)
                return (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    background: u.bg, border: `1px solid ${u.border}`,
                    borderRadius: 'var(--r-sm)', flexWrap: 'wrap',
                  }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, color: u.color,
                      background: u.border, borderRadius: '4px',
                      padding: '0.15rem 0.5rem', whiteSpace: 'nowrap',
                    }}>{u.label}</span>
                    <span style={{ fontSize: '0.88rem', flex: 1, minWidth: '140px' }}>
                      {m.homeTeam?.flagEmoji} {m.homeTeam?.shortName}
                      <span style={{ color: 'var(--c-muted)', margin: '0 0.35rem' }}>vs.</span>
                      {m.awayTeam?.shortName} {m.awayTeam?.flagEmoji}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--c-muted)', whiteSpace: 'nowrap' }}>
                      {deFormat(m.kickoff)} Uhr
                    </span>
                    <button
                      onClick={() => setActiveGroup(m.group ?? 'A')}
                      style={{
                        background: u.color, color: '#0a0e1a',
                        border: 'none', borderRadius: '6px',
                        padding: '0.3rem 0.7rem', fontSize: '0.78rem',
                        fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      Gruppe {m.group} tippen →
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="dashboard-grid">

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

            {/* Progress bar */}
            {groupMatches.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--c-muted)', marginBottom: '6px' }}>
                  <span>Gruppe {activeGroup}</span>
                  <span style={{ color: tippedInGroup === groupMatches.length ? 'var(--c-green)' : 'var(--c-gold)', fontWeight: 600 }}>
                    {tippedInGroup === groupMatches.length ? '✓ Alle getippt!' : `${tippedInGroup} von ${groupMatches.length} getippt`}
                  </span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: 'var(--c-border)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(tippedInGroup / groupMatches.length) * 100}%`,
                    background: tippedInGroup === groupMatches.length ? 'var(--c-green)' : 'var(--c-gold)',
                    borderRadius: '4px', transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}

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
          <div className="sidebar-sticky" style={{ position: 'sticky', top: '80px' }}>
            <div className="card">
              <h4 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Rangliste</span>
                <Link href="/leaderboard" style={{ fontSize: '0.75rem', color: 'var(--c-gold)', textDecoration: 'none' }}>Alle →</Link>
              </h4>
              {leaderboard.length === 0 ? (
                <p style={{ color: 'var(--c-hint)', fontSize: '0.85rem' }}>🎯 Noch keine Tipps — sei der Erste!</p>
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
                      <div style={{ fontSize: '0.72rem', color: 'var(--c-hint)' }}>{classLabel(u.classCode)}</div>
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
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .dashboard-grid .sidebar-sticky { position: static !important; }
        }
      `}</style>
      </div>
    </>
  )
}
