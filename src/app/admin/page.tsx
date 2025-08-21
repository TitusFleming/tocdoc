import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { AdminDashboard } from './admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  try {
    // Server-side role enforcement - throws if not admin
    await requireAdmin()
  } catch (error) {
    // Not authorized - redirect to doctor dashboard  
    redirect('/doctor')
  }

  // Fetch doctors for the form
  const doctors = await prisma.user.findMany({
    where: { role: Role.DOCTOR },
    select: {
      id: true,
      email: true,
    },
    orderBy: { email: 'asc' }
  })

  return <AdminDashboard doctors={doctors} />
}