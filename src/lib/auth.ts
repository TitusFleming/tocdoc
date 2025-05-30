import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function getCurrentUserRole(): Promise<{ user: any; role: Role | null; email: string | null }> {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return { user: null, role: null, email: null }
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
      return { user: clerkUser, role: null, email: null }
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { role: true, email: true, id: true }
    })

    return {
      user: clerkUser,
      role: dbUser?.role || null,
      email: email
    }
  } catch (error) {
    console.error('Error getting current user role:', error)
    return { user: null, role: null, email: null }
  }
}

export async function requireRole(requiredRole: Role) {
  const { role, email } = await getCurrentUserRole()
  
  if (!role) {
    throw new Error('User not found in database')
  }
  
  if (role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}, current role: ${role}`)
  }
  
  return { role, email }
} 