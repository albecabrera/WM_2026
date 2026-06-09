'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeProvider'

const SCHOOL_META: Record<'bbg' | 'esg', { short: string; full: string; color: string; accentBg: string; accentBorder: string; classLabel: string }> = {
  bbg: { short: 'BBG', full: 'BBG Bonn', color: '#3b82f6', accentBg: 'rgba(59,130,246,0.08)', accentBorder: 'rgba(59,130,246,0.3)', classLabel: 'Gelb' },
  esg: { short: 'ESG', full: 'Elisabeth-Selbert-Gesamtschule', color: '#f5c842', accentBg: 'rgba(245,200,66,0.08)', accentBorder: 'rgba(245,200,66,0.3)', classLabel: 'Klasse 4' },
}

type Step = 'school' | 'role' | 'student-code' | 'teacher-code'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('school')
  const [selectedSchool, setSelectedSchool] = useState<'bbg' | 'esg' | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function selectSchool(s: 'bbg' | 'esg') {
    setSelectedSchool(s)
    setCode('')
    setError('')
    setStep('role')
  }

  async function handleLogin(allowedRoles?: string[]) {
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

    if (!res.ok) { setError(data.error || 'Ungültiger Code'); return }

    if (allowedRoles && !allowedRoles.includes(data.role)) {
      setError('Dieser Code gehört nicht zu einer Lehrkraft. Bitte den Schüler-Login verwenden.')
      return
    }

    if (data.role === 'ADMIN') router.push('/admin')
    else router.push('/dashboard')
  }

  const meta = selectedSchool ? SCHOOL_META[selectedSchool] : null

  const SchoolBadge = () => meta ? (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.3rem 1rem',
      background: meta.accentBg, border: `1px solid ${meta.accentBorder}`,
      borderRadius: '100px', fontSize: '0.78rem', color: meta.color,
      marginBottom: '1.25rem',
    }}>
      🏫 {meta.full} · <strong>{meta.classLabel}</strong>
    </div>
  ) : null

  const BackBtn = ({ to, label = '← Zurück' }: { to: Step; label?: string }) => (
    <button onClick={() => { setStep(to); setCode(''); setError(''); setSchoolError('') }}
      style={{ background: 'none', border: 'none', color: 'var(--c-muted)', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '1.25rem', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
      {label}
    </button>
  )

  return (
    <>
      <style>{`
        .login-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 480px; }
        .login-left { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; }
        .login-ball-bg { position: absolute; inset: 0; background: url('/bg-pitch.jpg') center center / cover no-repeat; }
        .login-ball-overlay { position: absolute; inset: 0; background: var(--hero-overlay); }
        .login-left-content { position: relative; z-index: 2; text-align: center; color: var(--c-text); }
        .login-right { background: var(--c-surface); border-left: 1px solid var(--c-border); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 2.5rem; position: relative; transition: background 0.25s; }
        .login-right-top { position: absolute; top: 1.25rem; right: 1.25rem; }
        .school-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; width: 100%; margin-bottom: 1.25rem; }
        .school-card { border: 2px solid var(--c-border); border-radius: 12px; padding: 1.1rem 0.75rem; text-align: center; cursor: pointer; transition: all 0.18s; background: transparent; color: var(--c-text); }
        .school-card:hover { border-color: var(--c-muted); }
        .school-card.selected-bbg { border-color: #3b82f6; background: rgba(59,130,246,0.08); }
        .school-card.selected-esg { border-color: #f5c842; background: rgba(245,200,66,0.08); }
        .school-card-abbr { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; line-height: 1; margin-bottom: 0.2rem; }
        .school-card-name { font-size: 0.68rem; color: var(--c-muted); line-height: 1.3; margin-bottom: 0.35rem; }
        .school-card-class { display: inline-block; font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.08); }
        .role-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; width: 100%; margin-bottom: 0.5rem; }
        .role-card { border: 2px solid var(--c-border); border-radius: 12px; padding: 1.25rem 0.75rem; text-align: center; cursor: pointer; transition: all 0.18s; background: transparent; color: var(--c-text); }
        .role-card:hover { border-color: var(--c-gold); background: rgba(245,200,66,0.05); }
        .role-card-icon { font-size: 1.8rem; margin-bottom: 0.4rem; }
        .role-card-label { font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; color: var(--c-gold); }
        .role-card-sub { font-size: 0.7rem; color: var(--c-hint); margin-top: 0.2rem; }
        .dsgvo-box { margin-top: 1.5rem; padding: 0.85rem 1rem; background: rgba(59,130,246,0.07); border: 1px solid rgba(59,130,246,0.18); border-radius: var(--r-sm); font-size: 0.72rem; color: var(--c-hint); line-height: 1.55; }
        @media (max-width: 768px) {
          .login-page { grid-template-columns: 1fr; grid-template-rows: 200px 1fr; }
          .login-right { border-left: none; border-top: 1px solid var(--c-border); padding: 2rem 1.5rem; }
          .login-left-content h2 { font-size: 2.5rem; }
        }
      `}</style>

      <div className="login-page">
        {/* Left */}
        <div className="login-left">
          <div className="login-ball-bg" />
          <div className="login-ball-overlay" />
          <div className="login-left-content">
            <div style={{ fontSize: 'clamp(3rem,8vw,5rem)', marginBottom: '1rem', filter: 'drop-shadow(0 0 24px rgba(245,200,66,0.5))' }}>⚽</div>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(2.5rem,6vw,4.5rem)', color: 'var(--c-gold)', lineHeight: 1, marginBottom: '0.5rem' }}>WM 2026</h2>
            <p style={{ color: 'var(--c-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '2rem' }}>
              Tipp-Spiel · BBG &amp; ESG
            </p>
            <div style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem', maxWidth: '320px', textAlign: 'left' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--c-hint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>So sammelst du Punkte</p>
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

        {/* Right */}
        <div className="login-right">
          <div className="login-right-top"><ThemeToggle /></div>
          <div style={{ width: '100%', maxWidth: '340px' }}>

            {/* ── Step 1: school selection ── */}
            {step === 'school' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏫</div>
                  <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.4rem', color: 'var(--c-gold)', lineHeight: 1, marginBottom: '0.4rem' }}>Schule wählen</h1>
                  <p style={{ color: 'var(--c-muted)', fontSize: '0.88rem' }}>Wähle deine Schule aus.</p>
                </div>

                <div className="school-cards">
                  {(['bbg', 'esg'] as const).map((s) => {
                    const m = SCHOOL_META[s]
                    return (
                      <button key={s} className={`school-card${selectedSchool === s ? ` selected-${s}` : ''}`} onClick={() => selectSchool(s)}>
                        <div className="school-card-abbr" style={{ color: selectedSchool === s ? m.color : 'var(--c-text)' }}>{m.short}</div>
                        <div className="school-card-name">{m.full}</div>
                        <span className="school-card-class" style={{ color: m.color, background: m.accentBg, border: `1px solid ${m.accentBorder}` }}>
                          {m.classLabel}
                        </span>
                      </button>
                    )
                  })}
                </div>

              </>
            )}

            {/* ── Step 2: role selection ── */}
            {step === 'role' && meta && (
              <>
                <BackBtn to="school" label="← Schule wechseln" />
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <SchoolBadge />
                  <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.2rem', color: 'var(--c-gold)', lineHeight: 1, marginBottom: '0.4rem' }}>Wer bist du?</h1>
                </div>
                <div className="role-cards">
                  <button className="role-card" onClick={() => { setCode(''); setError(''); setStep('student-code') }}>
                    <div className="role-card-icon">🎒</div>
                    <div className="role-card-label">Schüler/in</div>
                    <div className="role-card-sub">Schülercode eingeben</div>
                  </button>
                  <button className="role-card" onClick={() => { setCode(''); setError(''); setStep('teacher-code') }}>
                    <div className="role-card-icon">👩‍🏫</div>
                    <div className="role-card-label">Lehrkraft</div>
                    <div className="role-card-sub">Direkt einloggen</div>
                  </button>
                </div>
              </>
            )}

            {/* ── Step 3a: student — personal code only ── */}
            {step === 'student-code' && meta && (
              <>
                <BackBtn to="role" />
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                  <SchoolBadge />
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎒</div>
                  <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.4rem', color: 'var(--c-gold)', lineHeight: 1, marginBottom: '0.4rem' }}>Schüler-Login</h1>
                </div>

                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--c-muted)', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Dein persönlicher Code
                </label>
                <input className="input" type="text"
                  placeholder=""
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  autoCapitalize="none" autoCorrect="off" spellCheck={false}
                  autoFocus
                  style={{ fontSize: '1rem', letterSpacing: '0.05em' }}
                />

                {error && (
                  <p style={{ marginTop: '0.75rem', padding: '0.65rem 0.9rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--r-sm)', color: 'var(--c-red)', fontSize: '0.85rem' }}>
                    ⚠️ {error}
                  </p>
                )}

                <button className="btn btn-primary" onClick={() => handleLogin()}
                  disabled={loading || !code.trim()}
                  style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', fontSize: '1rem', padding: '0.85rem', opacity: loading ? 0.7 : 1 }}>
                  {loading ? '⏳ Lädt...' : 'Los geht\'s! →'}
                </button>

                <div className="dsgvo-box">
                  <p style={{ fontWeight: 600, color: 'var(--c-muted)', marginBottom: '0.35rem' }}>🔒 Datenschutz (DSGVO)</p>
                  <p>⚠️ <strong>Nur Phantasienamen verwenden</strong> — keine echten Namen eingeben.</p>
                  <p style={{ marginTop: '0.3rem' }}>Keine Tracker · Keine Tracking-Cookies · Keine Werbung.</p>
                </div>
              </>
            )}

            {/* ── Step 3b: teacher — direct code only ── */}
            {step === 'teacher-code' && meta && (
              <>
                <BackBtn to="role" />
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <SchoolBadge />
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👩‍🏫</div>
                  <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.6rem', color: 'var(--c-gold)', lineHeight: 1, marginBottom: '0.4rem' }}>Lehrer-Login</h1>
                  <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem' }}>Gib deinen persönlichen Lehrer-Code ein</p>
                </div>

                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--c-muted)', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Dein Lehrer-Code
                </label>
                <input className="input" type="text"
                  placeholder=""
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin(['TEACHER', 'ADMIN'])}
                  autoCapitalize="none" autoCorrect="off" spellCheck={false}
                  autoFocus
                  style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}
                />

                {error && (
                  <p style={{ marginTop: '0.75rem', padding: '0.65rem 0.9rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--r-sm)', color: 'var(--c-red)', fontSize: '0.85rem' }}>
                    ⚠️ {error}
                  </p>
                )}

                <button className="btn btn-primary" onClick={() => handleLogin(['TEACHER', 'ADMIN'])}
                  disabled={loading || !code.trim()}
                  style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', fontSize: '1rem', padding: '0.85rem', opacity: loading ? 0.7 : 1 }}>
                  {loading ? '⏳ Lädt...' : 'Einloggen →'}
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
