import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { role, userId } = await getCurrentUserRole()
    if (!role || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') as 'ADMITTED' | 'DISCHARGED' | null

    const where: any = {}

    if (role !== Role.ADMIN) {
      where.doctorId = userId
    }

    if (status && (status === 'ADMITTED' || status === 'DISCHARGED')) {
      where.status = status
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { admissionDate: 'desc' },
      include: {
        images: { select: { id: true, filename: true } },
        doctor: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('GET /api/events error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
