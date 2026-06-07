'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="relative" style={{ width: '100%', maxWidth: '420px' }}>

        {/* Trophy icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            background: 'rgba(245,200,66,0.12)',
            borderRadius: '50%',
            fontSize: '2.2rem',
            marginBottom: '1rem'
          }}>⚽</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--c-gold)', lineHeight: 1, marginBottom: '0.25rem' }}>
            WM 2026
          </h1>
          <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Tipp-Spiel · ESG Bonn
          </p>
        </div>

        <div className="card fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.25rem' }}>
            Anmelden
          </h2>
          <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Gib deinen Login-Code ein (z.B. <code style={{ color: 'var(--c-gold)' }}>mueller6a</code>)
          </p>

          <input
            className="input"
            type="text"
            placeholder="Dein Login-Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />

          {error && (
            <p style={{
              marginTop: '0.75rem',
              padding: '0.6rem 0.8rem',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--r-sm)',
              color: 'var(--c-red)',
              fontSize: '0.85rem'
            }}>
              {error}
            </p>
          )}

          <button
            className="btn btn-primary"
            onClick={handleLogin}
            disabled={loading || !code.trim()}
            style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Lädt...' : 'Los geht\'s →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--c-hint)', fontSize: '0.78rem', marginTop: '1.5rem' }}>
          Kein Code? Frag deinen Lehrer.
        </p>
      </div>
    </main>
  )
}
