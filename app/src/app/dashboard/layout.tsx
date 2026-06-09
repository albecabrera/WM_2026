'use client'

import { AuthGuard } from '@/components/AuthGuard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Lehrer también juegan y usan el dashboard; los admins van directo al panel.
  return (
    <AuthGuard roles={['STUDENT', 'TEACHER']} fallback="/admin">
      {children}
    </AuthGuard>
  )
}
