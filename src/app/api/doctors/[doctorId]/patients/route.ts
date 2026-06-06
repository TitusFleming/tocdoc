import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { role, userId } = await getCurrentUserRole()
    if (!role || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { doctorId } = await params

    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, role: true },
    })

    if (!doctor || doctor.role !== Role.DOCTOR) {
      return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
    }

    const patients = await prisma.event.findMany({
      where: { doctorId, status: 'ADMITTED' },
      orderBy: { admissionDate: 'desc' },
      select: {
        id: true,
        patientAlias: true,
        dobMonthYear: true,
        diagnosis: true,
        hospitalName: true,
        admissionDate: true,
        admissionTime: true,
        reviewed: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ patients })
  } catch (error) {
    console.error('GET /api/doctors/[doctorId]/patients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
