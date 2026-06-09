import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession, isTeacherOrAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSchool, getClassesForSchool, ALL_CLASSES } from '@/lib/classes'
import { PrintButton } from './PrintButton'

interface PageProps {
  searchParams: { class?: string }
}

export default async function KlassenlistePage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!isTeacherOrAdmin(session)) redirect('/dashboard')

  const filterClass = session.role === 'ADMIN' ? (searchParams.class ?? null) : null
  const filterSchool = session.role === 'ADMIN' ? ((searchParams as any).school as 'bbg' | 'esg' | undefined) : undefined
  const userSchool = getSchool(session.classCode) ?? 'bbg'
  const activeSchool: 'bbg' | 'esg' = filterSchool ?? (session.role === 'ADMIN' ? 'bbg' : userSchool)

  const schoolClasses = getClassesForSchool(activeSchool)
  const allowedCodes =
    session.role === 'ADMIN'
      ? filterClass ? [filterClass] : schoolClasses.map((c) => c.code)
      : [session.classCode]

  const users = await prisma.user.findMany({
    where: { classCode: { in: allowedCodes }, role: { in: ['STUDENT', 'TEACHER'] } },
    select: { name: true, classCode: true, loginCode: true, role: true },
    orderBy: [{ classCode: 'asc' }, { role: 'asc' }, { name: 'asc' }],
  })

  const classes = allowedCodes
    .map((code) => {
      const label = ALL_CLASSES.find((c: {code: string; label: string}) => c.code === code)?.label ?? code
      const classUsers = users.filter((u) => u.classCode === code)
      return {
        code,
        label,
        teachers: classUsers.filter((u) => u.role === 'TEACHER'),
        students: classUsers.filter((u) => u.role === 'STUDENT'),
      }
    })
    .filter((c) => c.teachers.length > 0 || c.students.length > 0)

  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <>
      <style>{`
        .kl-wrap { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
        .kl-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .kl-filter { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 2rem; }
        .kl-filter a {
          padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.82rem; text-decoration: none;
          border: 1px solid var(--c-border); color: var(--c-muted);
        }
        .kl-filter a.active { background: rgba(245,200,66,0.12); border-color: var(--c-gold); color: var(--c-gold); }
        .kl-class { margin-bottom: 3rem; }
        .kl-class-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem;
          color: var(--c-gold); border-bottom: 2px solid var(--c-border);
          padding-bottom: 0.4rem; margin-bottom: 1rem;
        }
        .kl-section-label {
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--c-hint); margin-bottom: 0.5rem;
        }
        .kl-teacher-row {
          display: flex; gap: 1rem; align-items: center;
          padding: 0.5rem 0.75rem; background: rgba(245,200,66,0.06);
          border: 1px solid rgba(245,200,66,0.15); border-radius: 6px;
          margin-bottom: 0.4rem;
        }
        .kl-teacher-name { font-weight: 600; flex: 1; font-size: 0.92rem; }
        .kl-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
        .kl-table th { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--c-hint); padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--c-border); text-align: left; }
        .kl-table td { padding: 0.45rem 0.5rem; font-size: 0.88rem; border-bottom: 1px solid var(--c-border); }
        .kl-table tr:last-child td { border-bottom: none; }
        .kl-table .num { color: var(--c-hint); width: 2rem; }
        .kl-table .code { font-family: monospace; color: var(--c-gold); font-size: 0.85rem; }
        /* ── Tarjetas recortables ───────────────────────────── */
        .kl-cards-section { margin-top: 2rem; break-before: page; }
        .kl-cards-label {
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--c-hint); margin-bottom: 0.75rem;
          border-top: 2px dashed var(--c-border); padding-top: 0.75rem;
        }
        .kl-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.5rem;
        }
        .kl-card {
          border: 1.5px dashed var(--c-border);
          border-radius: 8px;
          padding: 0.6rem 0.75rem;
          display: flex; flex-direction: column; gap: 0.3rem;
          background: var(--c-surface2);
        }
        .kl-card-name-label {
          font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--c-hint);
        }
        .kl-card-name-line {
          border-bottom: 1px solid var(--c-border2);
          height: 1.4rem; margin-bottom: 0.2rem;
        }
        .kl-card-fantasy {
          font-size: 0.7rem; color: var(--c-muted);
        }
        .kl-card-code {
          font-family: monospace; font-size: 0.78rem;
          color: var(--c-gold); font-weight: 700;
          word-break: break-all;
        }
        .kl-card-app {
          font-size: 0.6rem; color: var(--c-hint);
        }
        @media print {
          @page { margin: 10mm; }
          .no-print { display: none !important; }
          nextjs-portal { display: none !important; }
          html, body { background: white !important; color: black !important; font-size: 8.5pt !important; }
          /* ── Layout ── */
          .kl-wrap { padding: 0 !important; }
          .kl-header { break-after: avoid; page-break-after: avoid; margin-bottom: 3mm !important; }
          .kl-class { break-inside: auto; page-break-after: always; margin-bottom: 0 !important; }
          .kl-class:last-child { page-break-after: avoid; }
          /* ── Lista compacta (cabe en 1-2 páginas) ── */
          .kl-class-title {
            font-size: 16pt !important; color: #222 !important;
            border-color: #ccc !important; padding-bottom: 1mm !important; margin-bottom: 2mm !important;
          }
          .kl-section-label { font-size: 7pt !important; margin-bottom: 1mm !important; color: #666 !important; }
          .kl-teacher-row {
            background: #f5f5f5 !important; border-color: #ddd !important;
            padding: 1.5mm 2.5mm !important; margin-bottom: 1mm !important; border-radius: 2px !important;
          }
          .kl-teacher-name { font-size: 8.5pt !important; }
          .kl-table { margin-top: 1mm !important; }
          .kl-table th {
            font-size: 6.5pt !important; padding: 1mm 1.5mm !important;
            border-color: #ccc !important; color: #666 !important;
          }
          .kl-table td {
            font-size: 8pt !important; padding: 1mm 1.5mm !important;
            border-color: #e5e5e5 !important; color: black !important;
            line-height: 1.2 !important;
          }
          .kl-table .code { font-size: 7.5pt !important; color: #222 !important; }
          .kl-table .num { color: #999 !important; }
          /* ── Tarjetas: 5 col × 6 filas = 30 en 1 página ── */
          .kl-cards-section { break-before: always; page-break-before: always; margin-top: 0 !important; }
          .kl-cards-label {
            font-size: 7pt !important; border-color: #bbb !important;
            color: #888 !important; padding-top: 2mm !important; margin-bottom: 2mm !important;
          }
          .kl-cards-grid {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 3mm !important;
          }
          .kl-card {
            border: 1px dashed #aaa !important;
            border-radius: 2px !important; background: white !important;
            padding: 2mm 2.5mm !important; gap: 0.8mm !important;
            break-inside: avoid;
          }
          .kl-card-name-label { font-size: 6pt !important; color: #777 !important; }
          .kl-card-name-line { height: 6mm !important; border-color: #aaa !important; margin-bottom: 0.5mm !important; }
          .kl-card-fantasy { font-size: 6.5pt !important; color: #555 !important; }
          .kl-card-code { font-size: 7pt !important; color: #000 !important; }
          .kl-card-app { font-size: 5.5pt !important; color: #aaa !important; }
        }
      `}</style>

      <div className="kl-wrap">
        {/* Header */}
        <div className="kl-header">
          <div>
            <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.2rem', color: 'var(--c-gold)', lineHeight: 1, marginBottom: '0.25rem' }}>
              📋 Klassenliste
            </h1>
            <p style={{ color: 'var(--c-hint)', fontSize: '0.8rem' }}>
              WM 2026 Tipp-Spiel · ESG Bonn · Stand: {today}
            </p>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <PrintButton />
            <Link href="/dashboard" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>
              🏠 Dashboard
            </Link>
            <Link href="/admin" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>
              ← Admin
            </Link>
          </div>
        </div>

        {/* School + class filter — admin only */}
        {session.role === 'ADMIN' && (
          <div className="no-print" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem' }}>
              {(['bbg', 'esg'] as const).map((s) => (
                <Link key={s} href={`/klassenliste?school=${s}`}
                  style={{
                    padding: '0.3rem 0.9rem', borderRadius: '6px', textDecoration: 'none',
                    border: `1px solid ${activeSchool === s ? (s === 'bbg' ? '#3b82f6' : 'var(--c-gold)') : 'var(--c-border)'}`,
                    background: activeSchool === s ? (s === 'bbg' ? 'rgba(59,130,246,0.12)' : 'rgba(245,200,66,0.12)') : 'transparent',
                    color: activeSchool === s ? (s === 'bbg' ? '#3b82f6' : 'var(--c-gold)') : 'var(--c-muted)',
                    fontSize: '0.85rem', fontWeight: 700,
                  }}>
                  {s.toUpperCase()}
                </Link>
              ))}
            </div>
            <div className="kl-filter">
              <Link href={`/klassenliste?school=${activeSchool}`} className={!filterClass ? 'active' : ''}>Alle</Link>
              {schoolClasses.map((c) => (
                <Link key={c.code} href={`/klassenliste?school=${activeSchool}&class=${c.code}`}
                  className={filterClass === c.code ? 'active' : ''}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Class sections */}
        {classes.map((cls) => (
          <div key={cls.code} className="kl-class">
            <div className="kl-class-title">{cls.label.startsWith('Klasse') ? cls.label : `Klasse ${cls.label}`}</div>

            {/* Teachers */}
            {cls.teachers.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div className="kl-section-label">Lehrkräfte ({cls.teachers.length})</div>
                {cls.teachers.map((t) => (
                  <div key={t.loginCode} className="kl-teacher-row">
                    <span className="kl-teacher-name">👤 {t.name}</span>
                    <code className="kl-table code">{t.loginCode}</code>
                  </div>
                ))}
              </div>
            )}

            {/* Students */}
            <div>
              <div className="kl-section-label">Schülerinnen &amp; Schüler ({cls.students.length})</div>
              <table className="kl-table">
                <thead>
                  <tr>
                    <th className="num">#</th>
                    <th>Phantasiename</th>
                    <th>Login-Code</th>
                  </tr>
                </thead>
                <tbody>
                  {cls.students.map((s, i) => (
                    <tr key={s.loginCode}>
                      <td className="num">{i + 1}</td>
                      <td>{s.name}</td>
                      <td className="code">{s.loginCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas recortables */}
            <div className="kl-cards-section">
              <div className="kl-cards-label">✂ Ausschneiden &amp; verteilen — eine Karte pro Schüler/in</div>
              <div className="kl-cards-grid">
                {cls.students.map((s) => (
                  <div key={`card-${s.loginCode}`} className="kl-card">
                    <div className="kl-card-name-label">Name des Schülers / der Schülerin</div>
                    <div className="kl-card-name-line" />
                    <div className="kl-card-fantasy">🎭 {s.name}</div>
                    <div className="kl-card-code">🔑 {s.loginCode}</div>
                    <div className="kl-card-app">WM 2026 Tipp-Spiel · Klasse {cls.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {classes.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--c-hint)', padding: '3rem' }}>
            Keine Daten gefunden.
          </div>
        )}

        <div className="no-print" style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'var(--c-hint)', textAlign: 'center' }}>
          🔒 Nur Phantasienamen — Zuordnung zu echten Schülern bleibt offline beim Lehrer (DSGVO)
        </div>
      </div>
    </>
  )
}
