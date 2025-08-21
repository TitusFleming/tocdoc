import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { sendEventNotification } from '@/lib/email'

// PATCH /api/patients/[patientAlias]/discharge - Discharge a patient
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
    const { dischargeDate } = body

    if (!dischargeDate) {
      return NextResponse.json({ error: 'Discharge date is required' }, { status: 400 })
    }

    // Find the admitted patient
    const admission = await prisma.event.findFirst({
      where: {
        patientAlias: patientAlias,
        status: 'ADMITTED'
      }
    })

    if (!admission) {
      return NextResponse.json({ error: 'No active admission found for this patient' }, { status: 404 })
    }

    // Check permissions: Only assigned doctor or admin can discharge
    if (role !== Role.ADMIN && admission.doctorId !== userId) {
      return NextResponse.json({ error: 'Forbidden - Only assigned doctor or admin can discharge' }, { status: 403 })
    }

    // Validate discharge date is after admission date
    const dischargeDateObj = new Date(dischargeDate)
    if (dischargeDateObj < admission.admissionDate) {
      return NextResponse.json({ error: 'Discharge date cannot be before admission date' }, { status: 400 })
    }

    // Update the admission to discharged status
    const dischargedPatient = await prisma.event.update({
      where: { id: admission.id },
      data: {
        status: 'DISCHARGED',
        dischargeDate: dischargeDateObj
      },
      include: {
        doctor: true
      }
    })

    // Send discharge notification email
    if (dischargedPatient.doctor.email) {
      try {
        await sendEventNotification(dischargedPatient.doctor.email, 'DISCHARGE')
      } catch (emailError) {
        console.error('Failed to send discharge notification:', emailError)
        // Don't fail the discharge if email fails
      }
    }

    return NextResponse.json({ patient: dischargedPatient })
  } catch (error) {
    console.error('PATCH /api/patients/[patientAlias]/discharge error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
