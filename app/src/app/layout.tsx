import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WM 2026 Tipp-Spiel | ESG Bonn',
  description: 'Das offizielle WM 2026 Tipp-Spiel der Elisabeth-Selbert-Gesamtschule',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
