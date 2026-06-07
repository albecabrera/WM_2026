import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  // Teachers compete too, so they use the player dashboard; only admins are
  // routed straight to the admin panel.
  if (session.role === 'ADMIN') redirect('/admin')
  return <>{children}</>
}
