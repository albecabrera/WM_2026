import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const teams = await prisma.team.findMany({
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(teams)
}
