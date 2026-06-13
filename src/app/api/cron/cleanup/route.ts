import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/cron/cleanup - 30-day retention policy, invoked by Vercel Cron.
// Vercel sends "Authorization: Bearer ${CRON_SECRET}" when CRON_SECRET is set.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Images cascade-delete with their events.
    const discharged = await prisma.event.deleteMany({
      where: {
        status: 'DISCHARGED',
        dischargeDate: { lt: thirtyDaysAgo },
      },
    })

    const admitted = await prisma.event.deleteMany({
      where: {
        status: 'ADMITTED',
        createdAt: { lt: thirtyDaysAgo },
      },
    })

    const deleted = discharged.count + admitted.count
    console.log(`Retention cleanup: deleted ${deleted} events older than 30 days`)

    return NextResponse.json({ deleted })
  } catch (error) {
    console.error('GET /api/cron/cleanup error:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
