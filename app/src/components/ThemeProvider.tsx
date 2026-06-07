'use client'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('wm2026_theme') || 'dark'
    const isDark = saved === 'dark'
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    const theme = next ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('wm2026_theme', theme)
  }

  // Don't render until client has read localStorage — avoids hydration mismatch
  if (dark === null) return <div style={{ width: 34, height: 34 }} />

  return (
    <button className="theme-toggle" onClick={toggle} title={dark ? 'Heller Modus' : 'Dunkler Modus'}>
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
