'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeProvider'

export default function LoginPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!code.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginCode: code.trim() }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Fehler beim Login')
      return
    }

    if (data.role === 'ADMIN' || data.role === 'TEACHER') router.push('/admin')
    else router.push('/dashboard')
  }

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 480px;
        }
        .login-left {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }
        .login-ball-bg {
          position: absolute;
          inset: 0;
          background: url('/ball.jpg') center center / cover no-repeat;
        }
        .login-ball-overlay {
          position: absolute;
          inset: 0;
          background: var(--hero-overlay);
        }
        .login-left-content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: var(--c-text);
        }
        .login-right {
          background: var(--c-surface);
          border-left: 1px solid var(--c-border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          position: relative;
          transition: background 0.25s;
        }
        .login-right-top {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
        }
        @media (max-width: 768px) {
          .login-page {
            grid-template-columns: 1fr;
            grid-template-rows: 220px 1fr;
          }
          .login-right {
            border-left: none;
            border-top: 1px solid var(--c-border);
            padding: 2rem 1.5rem;
          }
          .login-left-content h2 { font-size: 2.5rem; }
        }
        .points-legend {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1.5rem;
          text-align: left;
          width: 100%;
          max-width: 340px;
        }
        .points-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.83rem;
          color: var(--c-muted);
        }
      `}</style>

      <div className="login-page">
        {/* Left — image */}
        <div className="login-left">
          <div className="login-ball-bg" />
          <div className="login-ball-overlay" />
          <div className="login-left-content">
            <div style={{ fontSize: 'clamp(3rem,8vw,5rem)', marginBottom: '1rem', filter: 'drop-shadow(0 0 24px rgba(245,200,66,0.5))' }}>
              ⚽
            </div>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(2.5rem,6vw,4.5rem)', color: 'var(--c-gold)', lineHeight: 1, marginBottom: '0.5rem' }}>
              WM 2026
            </h2>
            <p style={{ color: 'var(--c-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '2rem' }}>
              Tipp-Spiel · ESG Bonn
            </p>

            {/* Mini scoring guide */}
            <div style={{
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1.25rem',
              maxWidth: '320px',
              textAlign: 'left',
            }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--c-hint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                So sammelst du Punkte
              </p>
              {[
                { pts: '+3', label: 'Genaues Ergebnis (z.B. 2:1 = 2:1)', color: '#f5c842' },
                { pts: '+2', label: 'Richtige Tordifferenz',               color: '#22c55e' },
                { pts: '+1', label: 'Richtige Tendenz (Sieg / Unentsch.)', color: '#3b82f6' },
                { pts: '+5', label: 'Weltmeister richtig getippt 🏆',      color: '#f5c842' },
              ].map((r) => (
                <div key={r.pts} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem', color: r.color, minWidth: '28px' }}>{r.pts}</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="login-right">
          <div className="login-right-top">
            <ThemeToggle />
          </div>

          <div style={{ width: '100%', maxWidth: '340px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔐</div>
              <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.8rem', color: 'var(--c-gold)', lineHeight: 1, marginBottom: '0.4rem' }}>
                Anmelden
              </h1>
              <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem' }}>
                Gib deinen persönlichen Code ein
              </p>
            </div>

            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--c-muted)', marginBottom: '0.4rem', fontWeight: 500 }}>
              Dein Login-Code
            </label>
            <input
              className="input"
              type="text"
              placeholder="z.B. mueller6a"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}
            />

            {error && (
              <p style={{
                marginTop: '0.75rem',
                padding: '0.65rem 0.9rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 'var(--r-sm)',
                color: 'var(--c-red)',
                fontSize: '0.85rem',
              }}>
                ⚠️ {error}
              </p>
            )}

            <button
              className="btn btn-primary"
              onClick={handleLogin}
              disabled={loading || !code.trim()}
              style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', fontSize: '1rem', padding: '0.85rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '⏳ Lädt...' : 'Los geht\'s! →'}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--c-hint)', fontSize: '0.78rem', marginTop: '1.5rem' }}>
              Kein Code? Frag deinen Lehrer! 👋
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
