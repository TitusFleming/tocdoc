import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

// Fail closed: if ADMIN_EMAILS is not configured, nobody is an admin.
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS || '')
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

    const clerkName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null

    let user = await prisma.user.findUnique({ where: { email } })

    // Only admins listed in ADMIN_EMAILS may bootstrap their own account.
    // Doctors must be provisioned through the admin invite flow.
    if (!user && isAdminEmail(email)) {
      user = await prisma.user.create({
        data: { email, role: Role.ADMIN, name: clerkName },
      })
    }

    if (!user) {
      return { user: clerkUser, role: null, email, userId: null, name: clerkName }
    }

    // Keep name in sync with Clerk; promote to admin if added to ADMIN_EMAILS.
    const shouldPromote = isAdminEmail(email) && user.role !== Role.ADMIN
    const shouldSyncName = clerkName && user.name !== clerkName
    if (shouldPromote || shouldSyncName) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(shouldPromote && { role: Role.ADMIN }),
          ...(shouldSyncName && { name: clerkName }),
        },
      })
    }

    return {
      user: clerkUser,
      role: user.role,
      email,
      userId: user.id,
      name: user.name,
    }
  } catch (error) {
    console.error('Error getting current user role:', error)
    return { user: null, role: null, email: null, userId: null, name: null }
  }
}
