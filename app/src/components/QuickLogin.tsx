'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Mode = 'admin' | 'lehrer'

interface Props {
  mode: Mode
}

const CONFIG: Record<Mode, {
  icon: string
  title: string
  subtitle: string
  placeholder: string
  allowedRoles: string[]
  redirectTo: (role: string) => string
  roleError: string
  accentColor: string
  accentBg: string
}> = {
  admin: {
    icon: '🔐',
    title: 'Admin',
    subtitle: 'Schulleitung & IT',
    placeholder: 'Admin-Code eingeben',
    allowedRoles: ['ADMIN'],
    redirectTo: () => '/admin',
    roleError: 'Kein Admin-Konto. Bitte den Lehrer-Login verwenden.',
    accentColor: '#f5c842',
    accentBg: 'rgba(245,200,66,0.08)',
  },
  lehrer: {
    icon: '👩‍🏫',
    title: 'Lehrer',
    subtitle: 'Lehrkräfte',
    placeholder: 'Lehrer-Code eingeben',
    allowedRoles: ['TEACHER', 'ADMIN'],
    redirectTo: (role) => role === 'ADMIN' ? '/admin' : '/dashboard',
    roleError: 'Kein Lehrer-Konto. Bitte den Schüler-Login verwenden.',
    accentColor: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.08)',
  },
}

export function QuickLogin({ mode }: Props) {
  const cfg = CONFIG[mode]
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    const trimmed = code.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginCode: trimmed }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Ungültiger Code')
      return
    }

    if (!cfg.allowedRoles.includes(data.role)) {
      setError(cfg.roleError)
      return
    }

    router.push(cfg.redirectTo(data.role))
  }

  return (
    <div style={{
      background: 'var(--c-surface)',
      border: `1px solid var(--c-border)`,
      borderRadius: '14px',
      padding: '1.25rem',
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{
          width: '34px', height: '34px',
          borderRadius: '8px',
          background: cfg.accentBg,
          border: `1px solid ${cfg.accentColor}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
          flexShrink: 0,
        }}>
          {cfg.icon}
        </span>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem', color: cfg.accentColor, lineHeight: 1 }}>
            {cfg.title}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--c-hint)', lineHeight: 1.2 }}>
            {cfg.subtitle}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          className="input"
          type="text"
          placeholder={cfg.placeholder}
          value={code}
          onChange={(e) => { setCode(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          style={{ flex: 1, fontSize: '0.88rem', padding: '0.55rem 0.75rem', minWidth: 0 }}
        />
        <button
          onClick={submit}
          disabled={loading || !code.trim()}
          style={{
            background: cfg.accentColor,
            color: '#0a0e1a',
            border: 'none',
            borderRadius: 'var(--r-sm)',
            padding: '0.55rem 0.85rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !code.trim() ? 0.6 : 1,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {loading ? '…' : '→'}
        </button>
      </div>

      {error && (
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--c-red)',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--r-sm)',
          padding: '0.45rem 0.65rem',
          margin: 0,
        }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  )
}
