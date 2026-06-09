'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  /** Roles permitidos; sin especificar, basta cualquier sesión válida. */
  roles?: Array<'STUDENT' | 'TEACHER' | 'ADMIN'>
  /** A dónde mandar a un usuario logueado cuyo rol no está permitido (default /login). */
  fallback?: string
}

// Guard client-side: con el export estático ya no hay layouts server-side,
// así que la sesión (cookie httpOnly) se valida contra /api/me.
export function AuthGuard({ children, roles, fallback }: AuthGuardProps) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((me) => {
        if (cancelled) return
        if (!me) {
          router.replace('/login')
        } else if (roles && !roles.includes(me.role)) {
          router.replace(fallback ?? '/login')
        } else {
          setOk(true)
        }
      })
      .catch(() => {
        if (!cancelled) router.replace('/login')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ok) return null
  return <>{children}</>
}
