import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

// Check if email is in ADMIN_EMAILS environment variable (hard-coded admin accounts only)
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@tocdoc.com') // Default admin for demo
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

// Get current user's role and data
export async function getCurrentUserRole(): Promise<{ 
  user: any; 
  role: Role | null; 
  email: string | null;
  userId: string | null;
}> {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return { user: null, role: null, email: null, userId: null }
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
      return { user: clerkUser, role: null, email: null, userId: null }
    }

    // Determine role via ADMIN_EMAILS allowlist
    const isAdmin = isAdminEmail(email)
    const role = isAdmin ? Role.ADMIN : Role.DOCTOR

    // Ensure user exists in database
    const user = await prisma.user.upsert({
      where: { email },
      update: { role },
      create: { email, role },
    })

    return { 
      user: clerkUser, 
      role, 
      email,
      userId: user.id 
    }
  } catch (error) {
    console.error('Error getting current user role:', error)
    return { user: null, role: null, email: null, userId: null }
  }
}

// Require specific role for access - throws if unauthorized
export async function requireRole(requiredRole: Role) {
  const { role, email, userId } = await getCurrentUserRole()
  
  if (!role || !email || !userId) {
    throw new Error('User not found or not authenticated')
  }
  
  if (role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}, current role: ${role}`)
  }
  
  return { role, email, userId }
}

// Server-side role guards for pages
export async function requireAdmin() {
  return await requireRole(Role.ADMIN)
}

export async function requireDoctor() {
  return await requireRole(Role.DOCTOR)
}

// Get user by ID with role check
export async function getUserById(id: string, requireAdmin = false) {
  const { role } = await getCurrentUserRole()
  
  if (requireAdmin && role !== Role.ADMIN) {
    throw new Error('Admin access required')
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}