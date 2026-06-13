import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { sendEventNotification } from '@/lib/email'
import { dischargeSchema } from '@/lib/validation'

// PATCH /api/events/[id]/discharge - Discharge a patient by event id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { role, userId } = await getCurrentUserRole()
    if (!role || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const parsed = dischargeSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') },
        { status: 400 }
      )
    }
    const { dischargeDate, dischargeTime, dischargeNotes } = parsed.data

    const admission = await prisma.event.findUnique({ where: { id } })

    if (!admission || admission.status !== 'ADMITTED') {
      return NextResponse.json({ error: 'No active admission found' }, { status: 404 })
    }

    if (role !== Role.ADMIN && admission.doctorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const dischargeDateObj = new Date(dischargeDate)
    if (dischargeDateObj < admission.admissionDate) {
      return NextResponse.json({ error: 'Discharge date cannot be before admission date' }, { status: 400 })
    }

    const dischargedPatient = await prisma.event.update({
      where: { id },
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
    console.error('PATCH /api/events/[id]/discharge error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
