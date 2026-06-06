import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

async function deleteOldEvents() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  try {
    const dischargedCount = await prisma.event.deleteMany({
      where: {
        status: 'DISCHARGED',
        dischargeDate: { lt: thirtyDaysAgo },
      },
    })

    const admittedCount = await prisma.event.deleteMany({
      where: {
        status: 'ADMITTED',
        createdAt: { lt: thirtyDaysAgo },
      },
    })

    const total = dischargedCount.count + admittedCount.count
    if (total > 0) {
      console.log(`Deleted ${total} events older than 30 days`)
    }
  } catch (error) {
    console.error('Error deleting old events:', error)
  }
}

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
        images: { select: { id: true, url: true, filename: true } },
        doctor: { select: { name: true, email: true } },
      },
    })

    await deleteOldEvents()

    return NextResponse.json({ events })
  } catch (error) {
    console.error('GET /api/events error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
