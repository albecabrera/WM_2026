'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSchool } from '@/lib/classes'
import { PrintButton } from '../PrintButton'

interface ClassEntry {
  code: string
  label: string
  teachers: { name: string; loginCode: string }[]
  students: { name: string; loginCode: string }[]
}

export default function AlleKlassenPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ role: string } | null>(null)
  const [allClasses, setAllClasses] = useState<ClassEntry[]>([])

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (!me || me.role !== 'ADMIN') return router.replace('/login')
        setSession(me)
        return fetch('/api/admin/klassenliste')
          .then((r) => (r.ok ? r.json() : []))
          .then((data: any[]) =>
            setAllClasses(
              data
                .map((c) => ({ code: c.code, label: c.name, teachers: c.teachers, students: c.students }))
                .filter((c) => c.students.length > 0 || c.teachers.length > 0)
            )
          )
      })
      .catch(() => router.replace('/login'))
  }, [router])

  const bbg = allClasses.filter((c) => getSchool(c.code) === 'bbg')
  const esg = allClasses.filter((c) => getSchool(c.code) === 'esg')
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  if (!session) return null

  const ClassBlock = ({ cls }: { cls: ClassEntry }) => (
    <div className="kl-class">
      <div className="kl-class-title">
        {cls.label.startsWith('Klasse') ? cls.label : `Klasse ${cls.label}`}
      </div>

      {cls.teachers.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="kl-section-label">Lehrkräfte ({cls.teachers.length})</div>
          {cls.teachers.map((t) => (
            <div key={t.loginCode} className="kl-teacher-row">
              <span className="kl-teacher-name">👤 {t.name}</span>
              <code className="kl-code">{t.loginCode}</code>
            </div>
          ))}
        </div>
      )}

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
                <td className="kl-code">{s.loginCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ausschneidbare Karten */}
      <div className="kl-cards-section">
        <div className="kl-cards-label">✂ Ausschneiden &amp; verteilen — eine Karte pro Schüler/in</div>
        <div className="kl-cards-grid">
          {cls.students.map((s) => (
            <div key={`card-${s.loginCode}`} className="kl-card">
              <div className="kl-card-name-label">Name des Schülers / der Schülerin</div>
              <div className="kl-card-name-line" />
              <div className="kl-card-fantasy">🎭 {s.name}</div>
              <div className="kl-card-code">🔑 {s.loginCode}</div>
              <div className="kl-card-app">WM 2026 · {cls.label.startsWith('Klasse') ? cls.label : `Klasse ${cls.label}`}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; color: #111; }
        .no-print { display: flex; gap: 0.75rem; align-items: center; padding: 1rem 1.5rem;
          background: #f8f8f8; border-bottom: 1px solid #ddd; flex-wrap: wrap; }
        .btn-print { background: #c8960a; color: white; border: none; border-radius: 6px;
          padding: 0.55rem 1.2rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; }
        .btn-back { color: #666; font-size: 0.85rem; text-decoration: none; }
        .school-header { font-family: 'Bebas Neue', sans-serif; font-size: 2rem;
          letter-spacing: 0.05em; color: #b07800; border-bottom: 3px solid #e0c060;
          padding-bottom: 2mm; margin: 6mm 0 4mm; }
        .kl-wrap { padding: 1.5rem; max-width: 900px; margin: 0 auto; }
        /* ── Clase ── */
        .kl-class { margin-bottom: 3rem; }
        .kl-class-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem;
          color: #b07800; border-bottom: 2px solid #ddd; padding-bottom: 2mm; margin-bottom: 3mm; }
        .kl-section-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: #888; margin-bottom: 0.5rem; }
        .kl-teacher-row { display: flex; gap: 1rem; align-items: center;
          padding: 0.4rem 0.75rem; background: #fdf8ec; border: 1px solid #e8d88a;
          border-radius: 4px; margin-bottom: 0.4rem; }
        .kl-teacher-name { font-weight: 600; flex: 1; font-size: 0.9rem; }
        .kl-code { font-family: monospace; font-size: 0.85rem; color: #7a5c00; }
        .kl-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
        .kl-table th { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em;
          color: #888; padding: 0.35rem 0.5rem; border-bottom: 1px solid #ccc; text-align: left; }
        .kl-table td { padding: 0.35rem 0.5rem; font-size: 0.85rem; border-bottom: 1px solid #eee; }
        .kl-table tr:last-child td { border-bottom: none; }
        .kl-table .num { color: #bbb; width: 2rem; }
        /* ── Tarjetas ── */
        .kl-cards-section { margin-top: 1.5rem; }
        .kl-cards-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #aaa; border-top: 1.5px dashed #ccc;
          padding-top: 0.6rem; margin-bottom: 0.6rem; }
        .kl-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.5rem; }
        .kl-card { border: 1.5px dashed #ccc; border-radius: 6px; padding: 0.55rem 0.7rem;
          display: flex; flex-direction: column; gap: 0.25rem; }
        .kl-card-name-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.07em; color: #aaa; }
        .kl-card-name-line { border-bottom: 1px solid #bbb; height: 1.4rem; margin-bottom: 0.15rem; }
        .kl-card-fantasy { font-size: 0.68rem; color: #666; }
        .kl-card-code { font-family: monospace; font-size: 0.75rem; font-weight: 700; color: #333; word-break: break-all; }
        .kl-card-app { font-size: 0.58rem; color: #bbb; }
        /* ── Print ── */
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          .no-print { display: none !important; }
          nextjs-portal { display: none !important; }
          html, body { background: white !important; }
          .kl-wrap { padding: 0 !important; }
          .school-header { font-size: 14pt !important; margin: 2mm 0 2mm !important; break-before: always; page-break-before: always; }
          .school-header:first-of-type { break-before: avoid; page-break-before: avoid; }
          .kl-class { margin-bottom: 0 !important; }
          .kl-class + .kl-class { break-before: always; page-break-before: always; }
          .kl-class-title { font-size: 13pt !important; color: #222 !important;
            border-color: #bbb !important; padding-bottom: 1mm !important; margin-bottom: 1.5mm !important; }
          .kl-section-label { font-size: 6pt !important; margin-bottom: 0.8mm !important; color: #666 !important; }
          .kl-teacher-row { background: #f5f5f5 !important; border-color: #ddd !important;
            padding: 1mm 2mm !important; margin-bottom: 0.8mm !important; border-radius: 1px !important; }
          .kl-teacher-name { font-size: 7.5pt !important; }
          .kl-code { font-size: 7pt !important; color: #333 !important; }
          .kl-table th { font-size: 6pt !important; padding: 0.6mm 1.5mm !important; border-color: #ccc !important; }
          .kl-table td { font-size: 7.5pt !important; padding: 0.6mm 1.5mm !important;
            border-color: #eee !important; line-height: 1.15 !important; }
          .kl-table .num { font-size: 6.5pt !important; color: #aaa !important; }
          /* Tarjetas: 5×6 = 30 en 1 página */
          .kl-cards-section { break-before: always; page-break-before: always; margin-top: 0 !important; }
          .kl-cards-label { font-size: 6pt !important; border-color: #bbb !important;
            color: #999 !important; padding-top: 1.5mm !important; margin-bottom: 2mm !important; border-width: 1px !important; }
          .kl-cards-grid { display: grid !important; grid-template-columns: repeat(5, 1fr) !important; gap: 2.5mm !important; }
          .kl-card { border: 1px dashed #bbb !important; border-radius: 2px !important;
            padding: 1.5mm 2mm !important; gap: 0.5mm !important; break-inside: avoid; }
          .kl-card-name-label { font-size: 5.5pt !important; color: #888 !important; }
          .kl-card-name-line { height: 7mm !important; border-color: #aaa !important; margin-bottom: 0.3mm !important; }
          .kl-card-fantasy { font-size: 6pt !important; color: #555 !important; }
          .kl-card-code { font-size: 6.5pt !important; color: #000 !important; }
          .kl-card-app { font-size: 5pt !important; color: #bbb !important; }
        }
      `}</style>

      {/* Toolbar — solo en pantalla */}
      <div className="no-print">
        <PrintButton />
        <span style={{ fontSize: '0.8rem', color: '#888' }}>
          Alle {bbg.length + esg.length} Klassen · BBG + ESG · Stand: {today}
        </span>
        <a href="/klassenliste" className="btn-back">← Zurück zur Klassenliste</a>
      </div>

      <div className="kl-wrap">
        {/* ── BBG ── */}
        <div className="school-header">BBG — Farb-Klassen</div>
        {bbg.map((cls) => <ClassBlock key={cls.code} cls={cls} />)}

        {/* ── ESG ── */}
        <div className="school-header">ESG — Klassen 1–6</div>
        {esg.map((cls) => <ClassBlock key={cls.code} cls={cls} />)}
      </div>
    </>
  )
}
