import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { sendEventNotification } from '@/lib/email'
import { admissionSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const { role, userId } = await getCurrentUserRole()
    if (!role || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const parsed = admissionSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') },
        { status: 400 }
      )
    }

    const {
      patientAlias, dobMonthYear, diagnosis, hospitalName,
      admissionDate, admissionTime, doctorId, eventType, dischargeNotes,
    } = parsed.data

    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { email: true, role: true },
    })

    if (!doctor || doctor.role !== Role.DOCTOR) {
      return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
    }

    if (eventType === 'ADMIT') {
      // Scoped to this doctor: different doctors may use the same patient label.
      const existingAdmission = await prisma.event.findFirst({
        where: { patientAlias, doctorId, status: 'ADMITTED' },
      })

      if (existingAdmission) {
        return NextResponse.json(
          { error: 'This patient is already admitted under this doctor. Discharge before re-admitting.' },
          { status: 400 }
        )
      }

      const admission = await prisma.event.create({
        data: {
          patientAlias,
          dobMonthYear: dobMonthYear || null,
          diagnosis,
          hospitalName,
          admissionDate: new Date(admissionDate),
          admissionTime: admissionTime || null,
          status: 'ADMITTED',
          doctorId,
        },
      })

      await sendEventNotification(doctor.email, 'ADMISSION', doctorId)

      return NextResponse.json({ admission })
    } else {
      const existingAdmission = await prisma.event.findFirst({
        where: { patientAlias, doctorId, status: 'ADMITTED' },
      })

      if (!existingAdmission) {
        return NextResponse.json(
          { error: 'No active admission found for this patient under this doctor.' },
          { status: 400 }
        )
      }

      const discharge = await prisma.event.update({
        where: { id: existingAdmission.id },
        data: {
          status: 'DISCHARGED',
          dischargeDate: new Date(admissionDate),
          dischargeTime: admissionTime || null,
          dischargeNotes: dischargeNotes || null,
          diagnosis,
        },
      })

      await sendEventNotification(doctor.email, 'DISCHARGE', doctorId)

      return NextResponse.json({ discharge })
    }
  } catch (error) {
    console.error('POST /api/admissions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
