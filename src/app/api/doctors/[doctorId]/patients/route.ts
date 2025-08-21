import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

// GET /api/doctors/[doctorId]/patients - Get admitted patients for a doctor (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { role, userId } = await getCurrentUserRole()
    if (!role || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can view patients for any doctor
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { doctorId } = await params

    // Validate doctor exists
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, email: true, role: true }
    })

    if (!doctor || doctor.role !== Role.DOCTOR) {
      return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
    }

    // Get all admitted patients for this doctor
    const admittedPatients = await prisma.event.findMany({
      where: { 
        doctorId: doctorId,
        status: 'ADMITTED'
      },
      orderBy: { admissionDate: 'desc' },
      select: {
        id: true,
        patientAlias: true,
        dobMonthYear: true,
        diagnosis: true,
        hospitalName: true,
        admissionDate: true,
        reviewed: true,
        createdAt: true
      }
    })

    return NextResponse.json({ patients: admittedPatients })
  } catch (error) {
    console.error('GET /api/patients/[doctorId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
