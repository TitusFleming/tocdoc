import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { sendEventNotification } from '@/lib/email'
import { addDays } from 'date-fns'

// Delete events older than 30 days (based on discharge date for discharged patients, creation date for admitted)
async function deleteOldEvents() {
  const thirtyDaysAgo = addDays(new Date(), -30)
  try {
    // Delete discharged patients older than 30 days from discharge date
    const dischargedCount = await prisma.event.deleteMany({
      where: {
        status: 'DISCHARGED',
        dischargeDate: {
          lt: thirtyDaysAgo
        }
      }
    })

    // Delete admitted patients older than 30 days from creation date (long-term admits)
    const admittedCount = await prisma.event.deleteMany({
      where: {
        status: 'ADMITTED',
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    })

    const totalCount = dischargedCount.count + admittedCount.count
    console.log(`🗑️ Deleted ${totalCount} events older than 30 days (${dischargedCount.count} discharged, ${admittedCount.count} long-term admitted)`)
  } catch (error) {
    console.error('Error deleting old events:', error)
  }
}

// GET /api/events - Get events based on user role
export async function GET(request: NextRequest) {
  try {
    const { role, userId } = await getCurrentUserRole()
    if (!role || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') as 'ADMITTED' | 'DISCHARGED' | null

    // Build query
    const where: any = {}
    
    // Non-admins only see their events
    if (role !== Role.ADMIN) {
      where.doctorId = userId
    }
    
    // Filter by status if specified
    if (status && (status === 'ADMITTED' || status === 'DISCHARGED')) {
      where.status = status
    }

    // Get events
    const events = await prisma.event.findMany({
      where,
      orderBy: { admissionDate: 'desc' },
      select: {
        id: true,
        status: true,
        patientAlias: true,
        dobMonthYear: true,
        diagnosis: true,
        hospitalName: true,
        admissionDate: true,
        dischargeDate: true,
        reviewed: true,
        createdAt: true,
        doctorId: true
      }
    })

    // Clean up old events
    await deleteOldEvents()

    return NextResponse.json({ events })
  } catch (error) {
    console.error('GET /api/events error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// NOTE: Event creation is now handled by /api/admissions
// This endpoint now only supports GET for viewing patient history