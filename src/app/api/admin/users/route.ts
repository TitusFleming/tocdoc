import { NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    const { role } = await getCurrentUserRole()
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const doctors = await prisma.user.findMany({
      where: { role: Role.DOCTOR },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    })

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ doctors, allUsers })
  } catch (error) {
    console.error('GET /api/admin/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
