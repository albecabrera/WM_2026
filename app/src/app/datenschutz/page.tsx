import Link from 'next/link'
import { PageBg } from '@/components/PageBg'

export default function DatenschutzPage() {
  return (
    <>
      <style>{`
        .ds-wrap {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 6rem 1.5rem 3rem;
        }
        .ds-card {
          position: relative;
          z-index: 2;
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: 16px;
          padding: 2.5rem;
          max-width: 680px;
          width: 100%;
        }
        .ds-section { margin-bottom: 2rem; }
        .ds-section h2 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--c-gold);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .ds-section p, .ds-section li {
          font-size: 0.88rem;
          color: var(--c-muted);
          line-height: 1.65;
        }
        .ds-section ul { padding-left: 1.25rem; }
        .ds-section li { margin-bottom: 0.25rem; }
        .ds-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 100px;
          padding: 0.3rem 0.8rem;
          font-size: 0.75rem;
          color: #22c55e;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }
      `}</style>

      <PageBg src="/bg-stadium.jpg" />

      <div className="ds-wrap">
        <div className="ds-card">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.5rem', color: 'var(--c-gold)', lineHeight: 1, marginBottom: '0.4rem' }}>
              🔒 Datenschutz
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--c-hint)' }}>
              WM 2026 Tipp-Spiel · Elisabeth-Selbert-Gesamtschule Bonn
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <span className="ds-badge">✓ DSGVO-konform</span>
            <span className="ds-badge">✓ Keine Tracker</span>
            <span className="ds-badge">✓ Keine Werbung</span>
            <span className="ds-badge">✓ Daten bleiben lokal</span>
          </div>

          <div className="ds-section">
            <h2>1. Phantasienamen statt Klarnamen</h2>
            <p>
              In dieser App werden <strong>ausschließlich Phantasienamen</strong> verwendet
              (z.&nbsp;B. „Rasenrakete", „Ballblitz"). Es werden keine echten Namen,
              E-Mail-Adressen oder sonstigen personenbezogenen Daten gespeichert.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Die Zuordnung Code&nbsp;↔&nbsp;Person verbleibt <strong>offline beim Lehrer</strong>
              und ist nicht Teil der App.
            </p>
          </div>

          <div className="ds-section">
            <h2>2. Daten verlassen das Gerät nicht</h2>
            <p>
              Alle Tipps, Codes und Ergebnisse werden in einer <strong>lokalen Datenbank
              (SQLite)</strong> auf dem Schulrechner gespeichert. Es findet keine Übertragung
              an Dritte statt.
            </p>
            <ul>
              <li>Keine Cloud-Datenbank</li>
              <li>Kein externer Authentifizierungsdienst</li>
              <li>Login via schulinterner Code — kein Passwort, keine E-Mail</li>
            </ul>
          </div>

          <div className="ds-section">
            <h2>3. Session-Cookie (technisch notwendig)</h2>
            <p>
              Nach dem Login wird ein <strong>technisch notwendiges Session-Cookie</strong>
              gesetzt (<code>session</code>). Es enthält ausschließlich technische
              Anmeldedaten — Phantasiename, Klasse, Rolle und den Login-Code.
              Keine echten Namen, keine personenbezogenen Daten. Es handelt sich um kein
              Tracking-Cookie — keine Drittanbieter haben Zugriff (<code>httpOnly</code>).
            </p>
          </div>

          <div className="ds-section">
            <h2>4. Automatische Ergebnisabfrage (optional)</h2>
            <p>
              Wenn vom Administrator aktiviert, ruft der <strong>Server</strong> (nicht
              der Browser) die WM-Ergebnisse von&nbsp;
              <a href="https://www.football-data.org" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--c-gold)' }}>football-data.org</a> ab.
              Dabei werden <strong>keine Schülerdaten</strong> übertragen — nur eine
              Anfrage nach öffentlichen Spielergebnissen (Server-zu-Server).
            </p>
          </div>

          <div className="ds-section">
            <h2>5. Keine Tracker · Keine Werbung · Keine Analytics</h2>
            <p>
              Es sind keinerlei Drittanbieter-Skripte eingebunden: kein Google Analytics,
              kein Meta Pixel, keine Werbenetze. Die App läuft im Browser ohne externe
              JavaScript-Bibliotheken.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Auch die Schriftarten werden <strong>lokal vom Schulserver</strong> ausgeliefert
              (selbst gehostet) — es findet <strong>keine Verbindung zu Google&nbsp;Fonts</strong>
              oder anderen CDNs statt. Beim Aufruf der App wird keine IP-Adresse an Dritte übertragen.
            </p>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(59,130,246,0.07)',
            border: '1px solid rgba(59,130,246,0.18)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: 'var(--c-hint)',
          }}>
            <strong style={{ color: 'var(--c-muted)' }}>Verantwortlich:</strong>{' '}
            Elisabeth-Selbert-Gesamtschule Bonn · Klassen 5 &amp; 6 · WM 2026 Tipp-Spiel
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'var(--c-hint)', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← Startseite
            </Link>
            <Link href="/dashboard" style={{ color: 'var(--c-gold)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
              🏠 Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
