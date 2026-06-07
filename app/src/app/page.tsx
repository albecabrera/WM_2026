import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeProvider'
import { PageBg } from '@/components/PageBg'

export default async function LandingPage() {
  const session = await getSession()
  if (session) {
    if (session.role === 'ADMIN') redirect('/admin')
    redirect('/dashboard')
  }

  return (
    <>
      <style>{`
        .hero-section {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 6rem 1.5rem 3rem;
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(5rem, 18vw, 12rem);
          line-height: 0.85;
          letter-spacing: 0.03em;
          background: linear-gradient(135deg, #f5c842 0%, #ffd84d 45%, #c49a1a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 4px 24px rgba(245,200,66,0.3));
        }
        [data-theme="light"] .hero-title {
          background: linear-gradient(135deg, #c8960a 0%, #a07808 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }
        .hero-sub {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.2rem, 4vw, 2rem);
          color: var(--c-muted);
          letter-spacing: 0.3em;
          margin-top: 0.5rem;
        }
        .hero-school {
          font-size: 0.8rem;
          color: var(--c-hint);
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-top: 0.5rem;
          margin-bottom: 3rem;
        }
        .stat-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          max-width: 520px;
          width: 100%;
          margin-bottom: 3rem;
        }
        .stat-box {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: 12px;
          padding: 0.9rem 0.5rem;
          backdrop-filter: blur(12px);
        }
        .stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          color: var(--c-gold);
          line-height: 1;
        }
        .stat-label {
          font-size: 0.68rem;
          color: var(--c-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 3px;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--c-gold);
          color: #0a0e1a;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.06em;
          padding: 0.85rem 2.6rem;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 8px 32px rgba(245,200,66,0.25);
        }
        .cta-btn:hover {
          filter: brightness(1.08);
          transform: translateY(-2px);
          box-shadow: 0 16px 48px rgba(245,200,66,0.35);
        }
        .ball-glow {
          font-size: clamp(3.5rem, 10vw, 6rem);
          animation: float 4s ease-in-out infinite;
          filter: drop-shadow(0 0 32px rgba(245,200,66,0.4));
          margin-bottom: 1.5rem;
        }
        .landing-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          background: var(--nav-bg);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--c-border);
        }
        .landing-nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }
        .date-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: 100px;
          padding: 0.45rem 1.1rem;
          font-size: 0.85rem;
          color: var(--c-muted);
          margin-bottom: 2.5rem;
        }
        .date-pill strong { color: var(--c-gold); }
        @media (max-width: 480px) {
          .stat-row { grid-template-columns: repeat(2, 1fr); max-width: 280px; }
          .cta-btn { font-size: 1.2rem; padding: 0.75rem 2rem; }
        }
      `}</style>

      <PageBg src="/bg-stadium.jpg" hero />

      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.4rem', color: 'var(--c-gold)', letterSpacing: '0.05em' }}>
            ⚽ WM 2026
          </span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <ThemeToggle />
            <Link href="/dashboard" style={{ fontSize: '0.85rem', padding: '0.45rem 1.1rem', color: 'var(--c-muted)', textDecoration: 'none', border: '1px solid var(--c-border)', borderRadius: '8px' }}>
              Dashboard
            </Link>
            <Link href="/login" className="cta-btn" style={{ fontSize: '0.9rem', padding: '0.45rem 1.25rem', letterSpacing: '0.05em' }}>
              Anmelden →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="hero-content">
        <div className="ball-glow">🏆</div>

        <h1 className="hero-title">WM 2026</h1>
        <p className="hero-sub">Tipp-Spiel</p>
        <p className="hero-school">BBG &amp; ESG Bonn</p>

        <div className="date-pill">
          <strong>11. Juni</strong> – <strong>26. Juli 2026</strong>
          &nbsp;·&nbsp; USA · Kanada · Mexiko
        </div>

        <div className="stat-row">
          {[
            { num: '48',  label: 'Teams'   },
            { num: '104', label: 'Spiele'  },
            { num: '12',  label: 'Gruppen' },
            { num: '3',   label: 'Länder'  },
          ].map((s) => (
            <div key={s.label} className="stat-box">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <Link href="/login" className="cta-btn">
          🔐 Jetzt mitspielen
        </Link>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 2, textAlign: 'center',
        padding: '1.25rem', borderTop: '1px solid var(--c-border)',
        color: 'var(--c-hint)', fontSize: '0.75rem', letterSpacing: '0.08em',
      }}>
        BBG &amp; ESG Bonn · WM 2026
        <span style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.7rem' }}>
          🔒 Nur Phantasienamen · Daten bleiben lokal · Keine Tracker · Keine Tracking-Cookies
          {' · '}
          <a href="/datenschutz" style={{ color: 'inherit', textDecoration: 'underline' }}>Datenschutz</a>
        </span>
      </footer>
    </>
  )
}
