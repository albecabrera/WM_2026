'use client'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('wm2026_theme')
    const isDark = saved ? saved === 'dark' : true
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    const theme = next ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('wm2026_theme', theme)
  }

  return (
    <button className="theme-toggle" onClick={toggle} title={dark ? 'Heller Modus' : 'Dunkler Modus'}>
      {dark ? '☀️' : '🌙'}
    </button>
  )
}

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){var t=localStorage.getItem('wm2026_theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();`,
      }}
    />
  )
}
