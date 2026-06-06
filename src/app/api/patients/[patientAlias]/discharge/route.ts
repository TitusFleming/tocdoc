import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { sendEventNotification } from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ patientAlias: string }> }
) {
  try {
    const { role, userId } = await getCurrentUserRole()
    if (!role || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { patientAlias } = await params
    const body = await request.json()
    const { dischargeDate, dischargeTime, dischargeNotes } = body

    if (!dischargeDate) {
      return NextResponse.json({ error: 'Discharge date is required' }, { status: 400 })
    }

    const admission = await prisma.event.findFirst({
      where: { patientAlias, status: 'ADMITTED' },
    })

    if (!admission) {
      return NextResponse.json({ error: 'No active admission found for this patient' }, { status: 404 })
    }

    if (role !== Role.ADMIN && admission.doctorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const dischargeDateObj = new Date(dischargeDate)
    if (dischargeDateObj < admission.admissionDate) {
      return NextResponse.json({ error: 'Discharge date cannot be before admission date' }, { status: 400 })
    }

    const dischargedPatient = await prisma.event.update({
      where: { id: admission.id },
      data: {
        status: 'DISCHARGED',
        dischargeDate: dischargeDateObj,
        dischargeTime: dischargeTime || null,
        dischargeNotes: dischargeNotes || null,
      },
      include: { doctor: true },
    })

    await sendEventNotification(
      dischargedPatient.doctor.email,
      'DISCHARGE',
      dischargedPatient.doctorId
    )

    return NextResponse.json({ patient: dischargedPatient })
  } catch (error) {
    console.error('PATCH /api/patients/[patientAlias]/discharge error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
