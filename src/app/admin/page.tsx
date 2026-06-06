import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { AdminDashboard } from './admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/doctor')
  }

  const doctors = await prisma.user.findMany({
    where: { role: Role.DOCTOR },
    select: { id: true, email: true, name: true },
    orderBy: { name: 'asc' },
  })

  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    orderBy: { name: 'asc' },
  })

  return <AdminDashboard doctors={doctors} allUsers={allUsers} />
}
