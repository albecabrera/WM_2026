import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function LandingPage() {
  const session = await getSession()
  if (session) {
    if (session.role === 'ADMIN' || session.role === 'TEACHER') redirect('/admin')
    redirect('/dashboard')
  }

  return (
    <>
      <style>{`
        .landing-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 70% 60% at 15% 5%,  rgba(245,200,66,0.10) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 85% 90%, rgba(59,130,246,0.09) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 50% 50%, rgba(245,200,66,0.04) 0%, transparent 70%);
        }
        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 1.1rem 1.5rem;
          text-align: center;
          backdrop-filter: blur(8px);
        }
        .stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.4rem;
          color: #f5c842;
          line-height: 1;
        }
        .stat-label {
          font-size: 0.72rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 4px;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #f5c842;
          color: #0a0e1a;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 0.06em;
          padding: 0.9rem 2.8rem;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .cta-btn:hover {
          background: #ffd84d;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(245,200,66,0.3);
        }
        .date-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 0.5rem 1.25rem;
          font-size: 0.88rem;
          color: #94a3b8;
          letter-spacing: 0.04em;
        }
        .date-badge span { color: #f5c842; font-weight: 600; }
        .trophy-glow {
          filter: drop-shadow(0 0 40px rgba(245,200,66,0.5));
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4.5rem, 14vw, 11rem);
          line-height: 0.88;
          letter-spacing: 0.02em;
          background: linear-gradient(135deg, #f5c842 0%, #ffd84d 40%, #c49a1a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.4rem, 4vw, 2.2rem);
          color: #94a3b8;
          letter-spacing: 0.25em;
        }
        @media (max-width: 640px) {
          .stats-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div className="landing-bg" />

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,14,26,0.7)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.4rem', color: '#f5c842', letterSpacing: '0.05em' }}>
            ⚽ WM 2026
          </span>
          <Link href="/login" className="cta-btn" style={{ fontSize: '0.9rem', padding: '0.45rem 1.25rem', letterSpacing: '0.05em' }}>
            Anmelden →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '6rem 1.5rem 4rem', position: 'relative', zIndex: 1, textAlign: 'center',
      }}>

        {/* Trophy */}
        <div className="trophy-glow" style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', marginBottom: '1.5rem' }}>
          🏆
        </div>

        {/* Title */}
        <h1 className="hero-title">WM 2026</h1>
        <p className="hero-sub" style={{ marginTop: '0.25rem', marginBottom: '1.5rem' }}>
          TIPP-SPIEL
        </p>
        <p style={{ color: '#475569', fontSize: '0.85rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '3rem' }}>
          Elisabeth-Selbert-Gesamtschule Bonn
        </p>

        {/* Stats */}
        <div className="stats-row" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem', maxWidth: '600px', width: '100%', marginBottom: '3.5rem',
        }}>
          {[
            { num: '48',  label: 'Teams'    },
            { num: '104', label: 'Spiele'   },
            { num: '12',  label: 'Gruppen'  },
            { num: '3',   label: 'Länder'   },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/login" className="cta-btn" style={{ marginBottom: '2.5rem' }}>
          🔐 Jetzt anmelden
        </Link>

        {/* Date badge */}
        <div className="date-badge">
          <span>11. Juni</span> – <span>26. Juli 2026</span>
          &nbsp;·&nbsp; USA · Kanada · Mexiko
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)',
        color: '#334155', fontSize: '0.78rem', letterSpacing: '0.08em',
      }}>
        ESG Bonn · Tipp-Spiel für Klassen 5 & 6 · WM 2026
      </footer>
    </>
  )
}
