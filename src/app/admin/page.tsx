import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import prisma from '@/lib/prisma'
import { getCurrentUserRole } from '@/lib/auth'
import { AdminDashboard } from './admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { user, role } = await getCurrentUserRole()

  if (!user) {
    redirect('/sign-in')
  }
  if (role !== Role.ADMIN) {
    redirect(role === Role.DOCTOR ? '/doctor' : '/pending')
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
