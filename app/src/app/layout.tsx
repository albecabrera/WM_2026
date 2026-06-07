import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WM 2026 Tipp-Spiel | BBG & ESG Bonn',
  description: 'Das offizielle WM 2026 Tipp-Spiel — BBG & Elisabeth-Selbert-Gesamtschule Bonn',
}

// Inline script injected before hydration — avoids theme flash (FOUC)
const themeScript = `(function(){var t=localStorage.getItem('wm2026_theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  )
}
