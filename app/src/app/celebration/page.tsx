'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function Confetti() {
  const pieces = Array.from({ length: 60 })
  const colors = ['#f5c842', '#22c55e', '#3b82f6', '#ef4444', '#ffffff', '#ffd700']
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {pieces.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 4
        const duration = 3 + Math.random() * 4
        const size = 6 + Math.random() * 10
        const color = colors[Math.floor(Math.random() * colors.length)]
        const rotate = Math.random() * 360
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${left}%`,
            top: '-20px',
            width: `${size}px`,
            height: `${size * 0.6}px`,
            background: color,
            borderRadius: '2px',
            opacity: 0.85,
            transform: `rotate(${rotate}deg)`,
            animation: `confettiFall ${duration}s ${delay}s ease-in infinite`,
          }} />
        )
      })}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 0.9; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function CelebrationContent() {
  const params = useSearchParams()
  const router = useRouter()
  const name = params.get('name') || 'Gewinner'
  const pts = params.get('pts') || '0'
  const cls = params.get('class') || ''
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(245,200,66,0.18) 0%, #0a0e1a 65%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '2rem',
    }}>
      <Confetti />

      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ fontSize: 'clamp(3rem,10vw,6rem)', marginBottom: '0.5rem', animation: 'pulse 2s ease infinite' }}>🏆</div>

        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
          letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--c-gold)',
          marginBottom: '0.75rem',
        }}>
          WM 2026 · Tipp-Spiel · ESG Bonn
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(4rem, 15vw, 12rem)',
          color: 'var(--c-gold)',
          lineHeight: 0.9,
          textShadow: '0 0 60px rgba(245,200,66,0.4)',
          marginBottom: '0.5rem',
          wordBreak: 'break-word',
        }}>
          {name}
        </h1>

        {cls && (
          <p style={{ fontSize: '1.3rem', color: 'var(--c-muted)', marginBottom: '0.5rem' }}>
            Klasse {cls.toUpperCase()}
          </p>
        )}

        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          color: '#ffffff',
          marginTop: '1rem',
          letterSpacing: '0.05em',
        }}>
          {pts} Punkte
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/admin')} className="btn btn-ghost">
            ← Zurück zum Admin
          </button>
          <button
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            ⛶ Vollbild
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CelebrationPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#f5c842' }}>🏆</span>
      </div>
    }>
      <CelebrationContent />
    </Suspense>
  )
}
