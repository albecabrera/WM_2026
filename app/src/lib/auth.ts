import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET fehlt in .env — App kann nicht starten. Siehe README.')
}

const JWT_SECRET = process.env.JWT_SECRET

export interface SessionUser {
  id: string
  name: string
  classCode: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  loginCode: string
}

export function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifyToken(token)
}

export function isTeacherOrAdmin(user: SessionUser): boolean {
  return user.role === 'TEACHER' || user.role === 'ADMIN'
}
