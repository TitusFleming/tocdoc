import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { sendEventNotification } from '@/lib/email'

// POST /api/admissions - Create new admission (admin only)
export async function POST(request: NextRequest) {
  try {
    const { role, userId } = await getCurrentUserRole()
    if (!role || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const {
      patientAlias,
      dobMonthYear,
      diagnosis,
      hospitalName,
      admissionDate,
      doctorId,
      eventType = 'ADMIT', // Default to ADMIT for backward compatibility
    } = body

    // Validate required fields (dobMonthYear is optional)
    if (!patientAlias || !diagnosis || !hospitalName || !admissionDate || !doctorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate doctor exists
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { email: true, role: true }
    })

    if (!doctor || doctor.role !== Role.DOCTOR) {
      return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
    }

    if (eventType === 'ADMIT') {
      // Check if patient is already admitted anywhere
      const existingAdmission = await prisma.event.findFirst({
        where: {
          patientAlias: patientAlias,
          status: 'ADMITTED'
        }
      })

      if (existingAdmission) {
        return NextResponse.json({ 
          error: 'Patient is already admitted. Please discharge before re-admitting.' 
        }, { status: 400 })
      }

      // Create admission
      const admission = await prisma.event.create({
        data: {
          patientAlias,
          dobMonthYear: dobMonthYear || null,
          diagnosis,
          hospitalName,
          admissionDate: new Date(admissionDate),
          status: 'ADMITTED',
          doctorId,
        }
      })

      // Send notification
      if (doctor.email) {
        await sendEventNotification(doctor.email, 'ADMISSION')
      }

      return NextResponse.json({ admission })
    } else if (eventType === 'DISCHARGE') {
      // Find existing admission to discharge
      const existingAdmission = await prisma.event.findFirst({
        where: {
          patientAlias: patientAlias,
          status: 'ADMITTED'
        }
      })

      if (!existingAdmission) {
        return NextResponse.json({ 
          error: 'No active admission found for this patient.' 
        }, { status: 400 })
      }

      // Update existing admission to discharged
      const discharge = await prisma.event.update({
        where: { id: existingAdmission.id },
        data: {
          status: 'DISCHARGED',
          dischargeDate: new Date(admissionDate), // Use the provided date as discharge date
          diagnosis: diagnosis, // Update diagnosis if provided
        }
      })

      return NextResponse.json({ discharge })
    } else {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }
  } catch (error) {
    console.error('POST /api/admissions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
