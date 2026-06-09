'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSchool, ALL_CLASSES } from '@/lib/classes'
import { PrintButton } from '../klassenliste/PrintButton'

interface Teacher {
  name: string
  classCode: string
  loginCode: string
}

export default function LehrerhandbuchPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ role: string; classCode: string } | null>(null)
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([])

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (!me) return router.replace('/login')
        if (me.role !== 'ADMIN' && me.role !== 'TEACHER') return router.replace('/dashboard')
        setSession(me)
        return fetch('/api/admin/teachers')
          .then((r) => (r.ok ? r.json() : []))
          .then(setAllTeachers)
      })
      .catch(() => router.replace('/login'))
  }, [router])

  if (!session) return null

  const isAdmin = session.role === 'ADMIN'
  const mySchool = isAdmin ? null : getSchool(session.classCode)

  const today = new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const classLabel = (code: string) =>
    ALL_CLASSES.find((c) => c.code === code)?.label ?? code

  const fullClassLabel = (code: string) => {
    const l = classLabel(code)
    return l.startsWith('Klasse') ? l : `Klasse ${l}`
  }

  const bbgTeachers = allTeachers.filter((t) => getSchool(t.classCode) === 'bbg')
  const esgTeachers = allTeachers.filter((t) => getSchool(t.classCode) === 'esg')

  // Eigene Lehrkraft-Codes (nicht-Admin sieht nur die eigene Klasse)
  const myTeachers = isAdmin ? allTeachers : allTeachers.filter((t) => t.classCode === session.classCode)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; color: #111; line-height: 1.55; }

        /* ── Toolbar ── */
        .toolbar { display: flex; gap: 0.75rem; align-items: center; padding: 0.9rem 1.5rem;
          background: #f4f4f4; border-bottom: 1px solid #ddd; flex-wrap: wrap; }
        .toolbar-title { font-weight: 700; font-size: 0.95rem; color: #333; flex: 1; }
        .btn-print-hb { background: #c8960a; color: white; border: none; border-radius: 6px;
          padding: 0.5rem 1.1rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; }
        .btn-back-hb { color: #888; font-size: 0.82rem; text-decoration: none; }

        /* ── Layout ── */
        .hb-wrap { max-width: 820px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
        .hb-title { font-family: 'Bebas Neue', sans-serif; font-size: 2.6rem;
          color: #b07800; letter-spacing: 0.04em; line-height: 1; margin-bottom: 0.25rem; }
        .hb-subtitle { font-size: 0.85rem; color: #888; margin-bottom: 0.5rem; }
        .hb-meta { font-size: 0.75rem; color: #bbb; margin-bottom: 2rem;
          border-bottom: 2px solid #e8c84a; padding-bottom: 0.75rem; }

        /* ── Sektionen ── */
        .hb-section { margin-bottom: 2rem; }
        .hb-section-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.35rem; color: #222;
          background: #f9f3e0; border-left: 4px solid #c8960a;
          padding: 0.35rem 0.75rem; margin-bottom: 0.9rem; letter-spacing: 0.03em;
        }
        .hb-section-title.blue { background: #e8f0fe; border-color: #3b82f6; }
        .hb-section-title.red  { background: #fdecea; border-color: #ef4444; }
        .hb-section-title.green{ background: #e8fdf0; border-color: #22c55e; }

        /* ── Schritte ── */
        .hb-steps { list-style: none; padding: 0; }
        .hb-steps li { display: flex; gap: 0.75rem; align-items: flex-start;
          padding: 0.55rem 0.75rem; border-bottom: 1px solid #f0f0f0; }
        .hb-steps li:last-child { border-bottom: none; }
        .hb-step-num { background: #c8960a; color: white; border-radius: 50%;
          width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
        .hb-step-num.blue { background: #3b82f6; }
        .hb-step-text { font-size: 0.88rem; }
        .hb-step-text strong { color: #111; }
        .hb-step-text code { background: #f4f4f4; border: 1px solid #ddd; border-radius: 3px;
          padding: 0.05rem 0.35rem; font-size: 0.82rem; font-family: monospace; color: #7a5c00; }

        /* ── Hinweis-Box ── */
        .hb-box { border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1rem; font-size: 0.85rem; }
        .hb-box.warn  { background: #fff8e6; border: 1px solid #f5d878; }
        .hb-box.info  { background: #e8f0fe; border: 1px solid #93c5fd; }
        .hb-box.ok    { background: #e8fdf0; border: 1px solid #86efac; }
        .hb-box.error { background: #fdecea; border: 1px solid #fca5a5; }
        .hb-box p { margin: 0; }
        .hb-box p + p { margin-top: 0.4rem; }

        /* ── Tabellen ── */
        .hb-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 1rem; }
        .hb-table th { background: #f8f3e0; color: #7a5c00; font-size: 0.72rem; text-transform: uppercase;
          letter-spacing: 0.07em; padding: 0.4rem 0.75rem; border-bottom: 2px solid #e8c84a; text-align: left; }
        .hb-table td { padding: 0.4rem 0.75rem; border-bottom: 1px solid #f0f0f0; }
        .hb-table tr:last-child td { border-bottom: none; }
        .hb-table .code { font-family: monospace; font-weight: 700; color: #7a5c00; }
        .hb-table .pts  { font-weight: 700; color: #c8960a; }

        /* ── Codes-Gitter ── */
        .hb-school-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: #888; margin: 1.2rem 0 0.5rem; }

        /* ── Punkte-Legende ── */
        .pts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.5rem; }
        .pts-item { border: 1px solid #f0f0f0; border-radius: 6px; padding: 0.6rem 0.75rem;
          display: flex; gap: 0.5rem; align-items: center; }
        .pts-badge { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem;
          min-width: 36px; text-align: center; color: #c8960a; }
        .pts-label { font-size: 0.78rem; color: #444; }

        /* ── Seitenumbruch-Helfer ── */
        .hb-break { break-before: always; page-break-before: always; }

        /* ── PRINT ── */
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          .toolbar { display: none !important; }
          nextjs-portal { display: none !important; }
          html, body { font-size: 9pt !important; background: white !important; color: black !important; }
          .hb-wrap { padding: 0 !important; max-width: 100% !important; }
          .hb-title { font-size: 22pt !important; color: #333 !important; }
          .hb-subtitle { font-size: 8pt !important; }
          .hb-meta { font-size: 7pt !important; color: #888 !important; }
          .hb-section { margin-bottom: 6mm !important; }
          .hb-section-title { font-size: 10pt !important; padding: 1.5mm 3mm !important; margin-bottom: 2mm !important; }
          .hb-steps li { padding: 1.5mm 2mm !important; }
          .hb-step-text { font-size: 8.5pt !important; }
          .hb-box { font-size: 8pt !important; padding: 2mm 3mm !important; }
          .hb-table th { font-size: 7pt !important; padding: 1mm 2mm !important; }
          .hb-table td { font-size: 8pt !important; padding: 1mm 2mm !important; }
          .pts-item { padding: 1.5mm 2mm !important; }
          .pts-badge { font-size: 12pt !important; min-width: 28px !important; }
          .pts-label { font-size: 7.5pt !important; }
          .hb-break { break-before: always !important; }
        }
      ` }} />

      {/* Toolbar */}
      <div className="toolbar">
        <span className="toolbar-title">📘 Lehrerhandbuch — WM 2026 Tipp-Spiel</span>
        <PrintButton />
        <Link href="/dashboard" className="btn-back-hb">🏠 Dashboard</Link>
        {isAdmin && <Link href="/klassenliste" className="btn-back-hb">📋 Klassenliste</Link>}
      </div>

      <div className="hb-wrap">

        {/* ── Titel ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="hb-title">Lehrerhandbuch</div>
          <div className="hb-subtitle">WM 2026 Tipp-Spiel · BBG &amp; ESG Bonn</div>
          <div className="hb-meta">Stand: {today} · Nur für Lehrkräfte und Administration · Vertraulich</div>
        </div>

        {/* ═══════════════════════════════════════════════════
            1. WAS IST DIESES SPIEL?
        ════════════════════════════════════════════════════ */}
        <div className="hb-section">
          <div className="hb-section-title">1. Was ist dieses Spiel?</div>
          <p style={{ fontSize: '0.88rem', marginBottom: '0.75rem' }}>
            Das WM 2026 Tipp-Spiel ist ein schulinternes Vorhersagespiel zur FIFA Weltmeisterschaft 2026
            (11. Juni – 26. Juli 2026, USA/Kanada/Mexiko). Schülerinnen, Schüler und Lehrkräfte tippen
            die Ergebnisse aller 104 Spiele und treten klassen- und schulweit gegeneinander an.
          </p>
          <div className="hb-box ok">
            <p>✅ <strong>Datenschutz:</strong> Es werden ausschließlich <strong>Phantasienamen</strong> verwendet.
            Keine echten Namen, keine E-Mail-Adressen, keine Passwörter. Alle Daten bleiben auf dem Schulrechner.</p>
          </div>
          <div className="hb-box warn">
            <p>⚠️ <strong>Wichtig:</strong> Die Zuordnung „Code ↔ echter Schüler" bleibt <strong>offline bei der Lehrkraft</strong> —
            nicht in der App, nicht im Klassenchat, nicht per E-Mail weiterleiten.</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            2. LOGIN — SCHRITT FÜR SCHRITT
        ════════════════════════════════════════════════════ */}
        <div className="hb-section">
          <div className="hb-section-title">2. Login — Schritt für Schritt</div>

          <p style={{ fontSize: '0.85rem', marginBottom: '0.6rem', fontWeight: 600 }}>Für Lehrkräfte und Schüler/innen identisch:</p>
          <ol className="hb-steps">
            <li>
              <span className="hb-step-num">1</span>
              <span className="hb-step-text">
                App im Browser öffnen: <code>http://&lt;IP-Schulrechner&gt;:3003</code>
                <br /><span style={{ fontSize: '0.78rem', color: '#888' }}>
                  Alle Geräte müssen im selben Schul-WLAN sein. IP-Adresse vom Admin erfragen.
                </span>
              </span>
            </li>
            <li>
              <span className="hb-step-num">2</span>
              <span className="hb-step-text">
                <strong>Schule auswählen</strong> (BBG oder ESG) und <strong>Schulcode eingeben:</strong>
                <br />
                BBG: <code>bbg-wm2026</code> &nbsp;|&nbsp; ESG: <code>esg-wm2026</code>
                <br /><span style={{ fontSize: '0.78rem', color: '#888' }}>
                  Dieser Code wird nicht gespeichert — er dient nur zur Schulauswahl im Browser.
                </span>
              </span>
            </li>
            <li>
              <span className="hb-step-num">3</span>
              <span className="hb-step-text">
                <strong>Persönlichen Login-Code eingeben</strong> (z.&nbsp;B. <code>defensivgeist-k4</code>)
                <br /><span style={{ fontSize: '0.78rem', color: '#888' }}>
                  Groß-/Kleinschreibung wird ignoriert. Leerzeichen am Anfang/Ende werden entfernt.
                </span>
              </span>
            </li>
            <li>
              <span className="hb-step-num">4</span>
              <span className="hb-step-text">
                <strong>Dashboard erscheint</strong> — das Spiel kann beginnen.
                Beim ersten Login erscheint ein kurzes Tutorial-Modal.
              </span>
            </li>
          </ol>

          <div className="hb-box info" style={{ marginTop: '0.75rem' }}>
            <p>ℹ️ <strong>Abmelden:</strong> Im Dashboard oben rechts auf den eigenen Namen klicken → <em>Abmelden</em>.
            Die Session bleibt 7 Tage aktiv (auch ohne Abmelden).</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            3. LOGIN-CODES DER LEHRKRÄFTE
        ════════════════════════════════════════════════════ */}
        <div className="hb-section hb-break">
          <div className="hb-section-title">3. Login-Codes der Lehrkräfte</div>
          <div className="hb-box warn">
            <p>⚠️ Diese Seite ist vertraulich. Login-Codes nicht öffentlich aushängen oder per Klassenchat teilen.</p>
          </div>

          {(isAdmin || mySchool === 'bbg') && (
            <>
              <div className="hb-school-label">BBG — Farb-Klassen</div>
              <table className="hb-table">
                <thead>
                  <tr><th>Klasse</th><th>Phantasiename</th><th>Login-Code</th></tr>
                </thead>
                <tbody>
                  {bbgTeachers.map((t) => (
                    <tr key={t.loginCode}>
                      <td>{fullClassLabel(t.classCode)}</td>
                      <td>{t.name}</td>
                      <td className="code">{t.loginCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {(isAdmin || mySchool === 'esg') && (
            <>
              <div className="hb-school-label">ESG — Klassen 1–6</div>
              <table className="hb-table">
                <thead>
                  <tr><th>Klasse</th><th>Phantasiename</th><th>Login-Code</th></tr>
                </thead>
                <tbody>
                  {esgTeachers.map((t) => (
                    <tr key={t.loginCode}>
                      <td>{fullClassLabel(t.classCode)}</td>
                      <td>{t.name}</td>
                      <td className="code">{t.loginCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {!isAdmin && (
            <div className="hb-box info">
              <p>ℹ️ Als Lehrkraft sehen Sie hier nur die Codes der eigenen Klasse.
              Für alle Codes: Admin ({<code>admin2026</code>}) kontaktieren.</p>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
            4. CODES AN SCHÜLER VERTEILEN
        ════════════════════════════════════════════════════ */}
        <div className="hb-section">
          <div className="hb-section-title">4. Codes an Schüler/innen verteilen</div>
          <ol className="hb-steps">
            <li>
              <span className="hb-step-num">1</span>
              <span className="hb-step-text">
                Im Browser einloggen (Admin-Code: <code>admin2026</code>) →
                Menü → <strong>Klassenliste</strong> → eigene Klasse auswählen
              </span>
            </li>
            <li>
              <span className="hb-step-num">2</span>
              <span className="hb-step-text">
                Auf <strong>„Drucken / PDF"</strong> klicken. Der Ausdruck enthält:
                <br />• <em>Seite 1:</em> Übersichtsliste mit allen Schüler-Codes
                <br />• <em>Seite 2:</em> 30 ausschneidbare Kärtchen (5 Spalten × 6 Zeilen)
              </span>
            </li>
            <li>
              <span className="hb-step-num">3</span>
              <span className="hb-step-text">
                Kärtchen ausschneiden. Auf jeder Karte ist eine <strong>Leerzeile für den echten Namen</strong> —
                dort handschriftlich den Namen des Kindes eintragen.
              </span>
            </li>
            <li>
              <span className="hb-step-num">4</span>
              <span className="hb-step-text">
                Karten verteilen — <strong>vor der Stunde</strong>, damit kein wertvoller Unterrichtszeit verloren geht.
              </span>
            </li>
            <li>
              <span className="hb-step-num">5</span>
              <span className="hb-step-text">
                Schüler/innen öffnen die App und loggen sich mit dem Code auf ihrer Karte ein.
                Beim ersten Login erscheint automatisch ein kurzes Tutorial.
              </span>
            </li>
          </ol>
          <div className="hb-box ok">
            <p>✅ <strong>Tipp:</strong> Unter <em>Admin → QR-Codes</em> kann für jeden Code ein QR-Code generiert
            werden. Ausdrucken und aushängen spart Tippfehler bei langen Codes.</p>
          </div>
          <div className="hb-box info" style={{ marginTop: '0.5rem' }}>
            <p>ℹ️ <strong>Alle Klassen auf einmal drucken:</strong> Klassenliste → <em>„Alle Klassen (BBG + ESG)"</em> →
            komplettes 24-seitiges Dokument für alle Klassen beider Schulen.</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            5. CODE VERGESSEN — ZURÜCKSETZEN
        ════════════════════════════════════════════════════ */}
        <div className="hb-section hb-break">
          <div className="hb-section-title red">5. Code vergessen — so wird er zurückgesetzt</div>

          <div className="hb-box warn">
            <p>⚠️ Codes werden <strong>zurückgesetzt</strong>, nicht gelöscht. Alle bisherigen Tipps und Punkte
            des Schülers / der Schülerin bleiben erhalten.</p>
          </div>

          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Schritt für Schritt:</p>
          <ol className="hb-steps">
            <li>
              <span className="hb-step-num hb-step-num" style={{ background: '#ef4444' }}>1</span>
              <span className="hb-step-text">
                Als Admin einloggen: <code>admin2026</code>
              </span>
            </li>
            <li>
              <span className="hb-step-num" style={{ background: '#ef4444' }}>2</span>
              <span className="hb-step-text">
                Im Admin-Panel oben auf den Tab <strong>„Code-Reset"</strong> klicken
              </span>
            </li>
            <li>
              <span className="hb-step-num" style={{ background: '#ef4444' }}>3</span>
              <span className="hb-step-text">
                Im Suchfeld <code>#Phantasiename</code> eingeben, z.&nbsp;B. <code>#Sturmheld</code>
                <br /><span style={{ fontSize: '0.78rem', color: '#888' }}>
                  Das <code>#</code>-Zeichen am Anfang ist Pflicht. Groß-/Kleinschreibung egal.
                </span>
              </span>
            </li>
            <li>
              <span className="hb-step-num" style={{ background: '#ef4444' }}>4</span>
              <span className="hb-step-text">
                Aus der Liste den richtigen Schüler / die richtige Schülerin auswählen
                (nach Klasse filtern, falls der Name mehrfach vorkommt)
              </span>
            </li>
            <li>
              <span className="hb-step-num" style={{ background: '#ef4444' }}>5</span>
              <span className="hb-step-text">
                Auf <strong>„Code zurücksetzen"</strong> klicken → neuer Code wird angezeigt
              </span>
            </li>
            <li>
              <span className="hb-step-num" style={{ background: '#ef4444' }}>6</span>
              <span className="hb-step-text">
                Neuen Code notieren und dem Kind mitteilen.
                <strong> Alten Code ist sofort ungültig.</strong>
              </span>
            </li>
          </ol>

          <div className="hb-box error" style={{ marginTop: '0.75rem' }}>
            <p>🚫 <strong>Nicht tun:</strong> Keinen neuen Schüler anlegen wenn ein Code verloren geht —
            sonst hat das Kind zwei Konten und die Punkte sind aufgeteilt. Immer <em>zurücksetzen</em>, nicht neu anlegen.</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            6. TIPPS ABGEBEN — REGELN FÜR DIE KLASSE
        ════════════════════════════════════════════════════ */}
        <div className="hb-section">
          <div className="hb-section-title">6. Tipps abgeben — Regeln für die Klasse</div>
          <ol className="hb-steps">
            <li>
              <span className="hb-step-num">1</span>
              <span className="hb-step-text">
                Im Dashboard auf <strong>„Tipps abgeben"</strong> klicken → Gruppe auswählen (A bis L)
              </span>
            </li>
            <li>
              <span className="hb-step-num">2</span>
              <span className="hb-step-text">
                Für jedes Spiel Heim- und Auswärts-Tore eintragen (z.&nbsp;B. 2 : 1)
              </span>
            </li>
            <li>
              <span className="hb-step-num">3</span>
              <span className="hb-step-text">
                Auf <strong>„Speichern"</strong> klicken — Bestätigung erscheint grün ✓
              </span>
            </li>
          </ol>

          <div className="hb-box error" style={{ marginTop: '0.6rem' }}>
            <p>🔒 <strong>Einsendeschluss:</strong> Tipps können nur bis <strong>5 Minuten vor Anpfiff</strong> abgegeben werden.
            Danach ist das Spiel gesperrt — auch für Lehrkräfte.</p>
          </div>
          <div className="hb-box warn" style={{ marginTop: '0.5rem' }}>
            <p>⚠️ <strong>Den Kindern sagen:</strong> Früh tippen, nicht erst kurz vor dem Spiel!
            WM-Spiele finden auch abends und nachts (Ortszeit Europa) statt.</p>
          </div>
          <div className="hb-box info" style={{ marginTop: '0.5rem' }}>
            <p>🏆 <strong>Weltmeister-Tipp:</strong> Einmalig bis <strong>11. Juni 2026 (Turnierbeginn)</strong> möglich.
            Gibt +5 Punkte extra bei richtiger Vorhersage. Danach nicht mehr änderbar.</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            7. PUNKTESYSTEM
        ════════════════════════════════════════════════════ */}
        <div className="hb-section">
          <div className="hb-section-title green">7. Punktesystem</div>
          <div className="pts-grid" style={{ marginBottom: '1rem' }}>
            {[
              { pts: '3', label: 'Genaues Ergebnis getippt (z.B. 2:1 = 2:1)' },
              { pts: '2', label: 'Richtige Tordifferenz (z.B. 3:2 statt 2:1)' },
              { pts: '1', label: 'Richtige Tendenz (Sieg / Unentschieden / Niederlage)' },
              { pts: '+5', label: 'Weltmeister richtig getippt (einmalig)' },
            ].map(({ pts, label }) => (
              <div key={pts} className="pts-item">
                <div className="pts-badge">{pts}</div>
                <div className="pts-label">{label}</div>
              </div>
            ))}
          </div>

          <table className="hb-table">
            <thead><tr><th>Preis</th><th>Beschreibung</th></tr></thead>
            <tbody>
              <tr><td>🎽 Gruppensieger</td><td>Beste/r Spieler/in der eigenen Klasse</td></tr>
              <tr><td>👑 Jahrgangsbeste/r</td><td>Beste/r Spieler/in aller Klassen (schulweit)</td></tr>
              <tr><td>🏅 Beste Klasse</td><td>Klasse mit den meisten Gesamtpunkten</td></tr>
            </tbody>
          </table>
        </div>

        {/* ═══════════════════════════════════════════════════
            8. RANGLISTE LESEN
        ════════════════════════════════════════════════════ */}
        <div className="hb-section hb-break">
          <div className="hb-section-title">8. Rangliste lesen</div>
          <ol className="hb-steps">
            <li>
              <span className="hb-step-num">1</span>
              <span className="hb-step-text">
                Im Hauptmenü auf <strong>„Rangliste"</strong> klicken
              </span>
            </li>
            <li>
              <span className="hb-step-num">2</span>
              <span className="hb-step-text">
                <strong>„Einzelwertung"</strong>: alle Spieler nach Punkten sortiert.
                Nach eigener Klasse filtern möglich.
              </span>
            </li>
            <li>
              <span className="hb-step-num">3</span>
              <span className="hb-step-text">
                <strong>„Klassenwertung"</strong>: welche Klasse hat insgesamt die meisten Punkte?
                Zeigt Gesamtpunkte, Durchschnitt und besten Spieler pro Klasse.
              </span>
            </li>
          </ol>
          <div className="hb-box info">
            <p>ℹ️ Punkte werden automatisch berechnet, sobald ein Spielergebnis eingetragen wird
            (automatisch per Sync oder manuell durch Admin).</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            9. ADMIN-FUNKTIONEN (nur Admin)
        ════════════════════════════════════════════════════ */}
        {isAdmin && (
          <div className="hb-section">
            <div className="hb-section-title blue">9. Admin-Funktionen (nur Admin-Code)</div>
            <div className="hb-box info">
              <p>Admin-Login-Code: <code>admin2026</code></p>
            </div>
            <table className="hb-table">
              <thead><tr><th>Funktion</th><th>Wo</th><th>Beschreibung</th></tr></thead>
              <tbody>
                <tr><td>Ergebnisse eintragen</td><td>Admin → Ergebnisse</td><td>Spielergebnis manuell eingeben → Punkte werden sofort berechnet</td></tr>
                <tr><td>Auto-Sync</td><td>Admin → Sync</td><td>Ergebnisse automatisch von football-data.org holen (API-Key nötig)</td></tr>
                <tr><td>KO-Bracket</td><td>Admin → KO-Runde</td><td>Teams nach Gruppenphase manuell einsetzen</td></tr>
                <tr><td>Elfmeterschießen</td><td>Admin → KO-Runde</td><td>Gewinner bei Unentschieden im KO manuell festlegen</td></tr>
                <tr><td>Weltmeister setzen</td><td>Admin → Finale</td><td>Offiziellen WM-Sieger eintragen → +5 Punkte für alle werden berechnet</td></tr>
                <tr><td>Schüler anlegen</td><td>Admin → Schüler</td><td>Neuen Phantasienamen und Code erstellen</td></tr>
                <tr><td>Code zurücksetzen</td><td>Admin → Code-Reset</td><td>Suche mit #Name → neuer Code generieren</td></tr>
                <tr><td>QR-Codes</td><td>Admin → QR-Codes</td><td>QR-Bild pro Login-Code für Aushang/Ausdruck</td></tr>
                <tr><td>Klassenliste drucken</td><td>/klassenliste</td><td>Alle Codes druckbar mit ausschneidbaren Karten</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            10. HÄUFIGE FEHLER
        ════════════════════════════════════════════════════ */}
        <div className="hb-section">
          <div className="hb-section-title red">{ isAdmin ? '10.' : '9.'} Häufige Fehler — und wie man sie vermeidet</div>
          <table className="hb-table">
            <thead><tr><th>Problem</th><th>Falsch</th><th>Richtig</th></tr></thead>
            <tbody>
              <tr>
                <td>Code vergessen</td>
                <td>Neues Konto anlegen</td>
                <td>Admin → Code-Reset → <code>#Name</code> suchen</td>
              </tr>
              <tr>
                <td>„Gespeichert" erscheint nicht</td>
                <td>Mehrfach klicken</td>
                <td>Internetverbindung prüfen, Seite neu laden, erneut tippen</td>
              </tr>
              <tr>
                <td>Spiel nicht mehr tippbar</td>
                <td>Admin fragen, es zu öffnen</td>
                <td>Deadline (5 Min. vor Anpfiff) ist abgelaufen — nicht mehr änderbar (so gewollt)</td>
              </tr>
              <tr>
                <td>Falsches Ergebnis eingetragen (Admin)</td>
                <td>Ergebnis löschen</td>
                <td>Richtiges Ergebnis erneut eintragen — überschreibt das alte, Punkte werden neu berechnet</td>
              </tr>
              <tr>
                <td>App nicht erreichbar</td>
                <td>App neu installieren</td>
                <td>IP-Adresse des Schulrechners prüfen; alle Geräte müssen im selben WLAN sein</td>
              </tr>
              <tr>
                <td>Echter Name eingegeben</td>
                <td>Stehen lassen</td>
                <td>Admin → Code-Reset → Phantasienamen korrigieren (Datenschutz!)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ═══════════════════════════════════════════════════
            11. WICHTIGE TERMINE
        ════════════════════════════════════════════════════ */}
        <div className="hb-section">
          <div className="hb-section-title">{ isAdmin ? '11.' : '10.'} Wichtige Termine</div>
          <table className="hb-table">
            <thead><tr><th>Datum</th><th>Ereignis</th></tr></thead>
            <tbody>
              <tr><td><strong>11. Juni 2026</strong></td><td>🏁 Turnierbeginn — Eröffnungsspiel Mexiko vs. Südafrika. Weltmeister-Tipp ab jetzt nicht mehr möglich.</td></tr>
              <tr><td>11. Juni – 2. Juli 2026</td><td>Gruppenphase (48 Spiele, 12 Gruppen)</td></tr>
              <tr><td>4. Juli – 7. Juli 2026</td><td>Runde der 32 (16 Spiele)</td></tr>
              <tr><td>9. Juli – 12. Juli 2026</td><td>Achtelfinale (8 Spiele)</td></tr>
              <tr><td>13. Juli – 14. Juli 2026</td><td>Viertelfinale (4 Spiele)</td></tr>
              <tr><td>17. Juli – 18. Juli 2026</td><td>Halbfinale (2 Spiele)</td></tr>
              <tr><td>22. Juli 2026</td><td>Spiel um Platz 3</td></tr>
              <tr><td><strong>26. Juli 2026</strong></td><td>🏆 Finale — MetLife Stadium, New Jersey</td></tr>
            </tbody>
          </table>
        </div>

        {/* ── Fußzeile ── */}
        <div style={{ marginTop: '2rem', paddingTop: '0.75rem', borderTop: '1px solid #ddd',
          fontSize: '0.72rem', color: '#bbb', textAlign: 'center' }}>
          WM 2026 Tipp-Spiel · BBG &amp; ESG Bonn · Stand {today} ·
          Nur für Lehrkräfte — vertraulich · Admin-Code: admin2026
        </div>

      </div>
    </>
  )
}
