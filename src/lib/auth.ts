import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@tocdoc.com')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

export async function getCurrentUserRole(): Promise<{
  user: any
  role: Role | null
  email: string | null
  userId: string | null
  name: string | null
}> {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return { user: null, role: null, email: null, userId: null, name: null }
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
      return { user: clerkUser, role: null, email: null, userId: null, name: null }
    }

    const isAdmin = isAdminEmail(email)
    const role = isAdmin ? Role.ADMIN : Role.DOCTOR

    const clerkName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null

    const user = await prisma.user.upsert({
      where: { email },
      update: { role, ...(clerkName && { name: clerkName }) },
      create: { email, role, name: clerkName },
    })

    return {
      user: clerkUser,
      role,
      email,
      userId: user.id,
      name: user.name,
    }
  } catch (error) {
    console.error('Error getting current user role:', error)
    return { user: null, role: null, email: null, userId: null, name: null }
  }
}

export async function requireRole(requiredRole: Role) {
  const { role, email, userId, name } = await getCurrentUserRole()

  if (!role || !email || !userId) {
    throw new Error('User not found or not authenticated')
  }

  if (role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}, current role: ${role}`)
  }

  return { role, email, userId, name }
}

export async function requireAdmin() {
  return await requireRole(Role.ADMIN)
}

export async function requireDoctor() {
  return await requireRole(Role.DOCTOR)
}
