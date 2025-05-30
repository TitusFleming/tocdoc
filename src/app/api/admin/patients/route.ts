import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUserRole, requireRole } from '@/lib/auth'
import { Role } from '@prisma/client'

// GET /api/admin/patients - Admin view of all patients with statistics
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    await requireRole(Role.ADMIN)

    // Get all patients with physician information
    const patients = await prisma.patient.findMany({
      include: {
        physician: {
          select: { 
            id: true,
            email: true,
            role: true 
          }
        }
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    })

    // Calculate statistics
    const stats = {
      total: patients.length,
      currentlyAdmitted: patients.filter(p => !p.discharge).length,
      recentlyDischarged: patients.filter(p => {
        if (!p.discharge) return false
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return new Date(p.discharge) >= sevenDaysAgo
      }).length,
      needingDeletion: patients.filter(p => {
        if (!p.discharge) return false
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return new Date(p.discharge) <= thirtyDaysAgo
      }).length
    }

    // Get physician summary
    const physicians = await prisma.user.findMany({
      where: { role: Role.PHYSICIAN },
      include: {
        _count: {
          select: { patients: true }
        }
      }
    })

    return NextResponse.json({
      patients,
      stats,
      physicians: physicians.map(p => ({
        id: p.id,
        email: p.email,
        patientCount: p._count.patients
      }))
    })

  } catch (error) {
    console.error('Admin API Error:', error)
    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/patients - Batch create patients
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const { email: adminEmail } = await requireRole(Role.ADMIN)

    const body = await request.json()
    const { patients: patientsData } = body

    const createdPatients = []
    const errors = []

    for (const patientData of patientsData) {
      try {
        const { name, dob, facility, diagnosis, admission, discharge, notes, physicianEmail } = patientData

        // Validate required fields
        if (!name || !dob || !facility || !diagnosis || !admission || !physicianEmail) {
          errors.push(`Missing required fields for patient ${name || 'Unknown'}. Please fill out all fields: name, date of birth, facility, diagnosis, admission date, and physician email.`)
          continue
        }

        // Validate dates
        const dobDate = new Date(dob)
        const admissionDate = new Date(admission)
        const dischargeDate = discharge ? new Date(discharge) : null

        if (isNaN(dobDate.getTime())) {
          errors.push(`Invalid date of birth for patient ${name}. Please enter a valid date.`)
          continue
        }

        if (isNaN(admissionDate.getTime())) {
          errors.push(`Invalid admission date for patient ${name}. Please enter a valid date.`)
          continue
        }

        // Check if admission date is in the future
        const now = new Date()
        if (admissionDate > now) {
          errors.push(`Admission date cannot be in the future for patient ${name}.`)
          continue
        }

        // Check if discharge date is valid (if provided)
        if (discharge && dischargeDate && isNaN(dischargeDate.getTime())) {
          errors.push(`Invalid discharge date for patient ${name}. Please enter a valid date or leave blank.`)
          continue
        }

        // Check if discharge date is after admission date
        if (dischargeDate && dischargeDate <= admissionDate) {
          errors.push(`Discharge date must be after admission date for patient ${name}.`)
          continue
        }

        // Find physician
        const physician = await prisma.user.findUnique({
          where: { email: physicianEmail },
        })

        if (!physician || physician.role !== Role.PHYSICIAN) {
          errors.push(`Physician not found: ${physicianEmail}. Please select a valid physician.`)
          continue
        }

        // Determine final discharge date (null if in future)
        const finalDischargeDate = dischargeDate && dischargeDate <= now ? dischargeDate : null

        // Create patient
        const patient = await prisma.patient.create({
          data: {
            name: name.trim(),
            dob: dobDate,
            facility: facility.trim(),
            diagnosis: diagnosis.trim(),
            admission: admissionDate,
            discharge: finalDischargeDate,
            notes: notes ? notes.trim() : null,
            physicianId: physician.id,
          },
          include: {
            physician: {
              select: { email: true }
            }
          }
        })

        createdPatients.push(patient)

        // Trigger notification
        const isAdmission = !finalDischargeDate
        const notificationType = isAdmission ? 'admission' : 'discharge'
        console.log(`🔔 Admin Created Patient: ${patient.name} (${notificationType}) for ${physician.email}`)
        
      } catch (patientError: unknown) {
        console.error('Patient creation error:', patientError)
        const errorMessage = patientError instanceof Error ? patientError.message : 'Unknown error occurred'
        errors.push(`Failed to create patient ${patientData.name || 'Unknown'}: ${errorMessage}`)
      }
    }

    // Revalidate dashboard and related pages to ensure fresh data
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/patients')
    revalidatePath('/dashboard/admin')

    return NextResponse.json({
      created: createdPatients.length,
      patients: createdPatients,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully created ${createdPatients.length} patients${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
    })

  } catch (error) {
    console.error('Admin API Error:', error)
    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/patients - Clean up expired records (30+ days)
export async function DELETE(request: NextRequest) {
  try {
    // Require admin role
    await requireRole(Role.ADMIN)

    // Find patients discharged more than 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const expiredPatients = await prisma.patient.findMany({
      where: {
        discharge: {
          lte: thirtyDaysAgo,
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        discharge: true
      }
    })

    // Delete expired patients
    const deleteResult = await prisma.patient.deleteMany({
      where: {
        discharge: {
          lte: thirtyDaysAgo,
          not: null
        }
      }
    })

    console.log(`🗑️ HIPAA Compliance: Deleted ${deleteResult.count} expired patient records`)

    return NextResponse.json({
      deleted: deleteResult.count,
      expiredPatients: expiredPatients,
      message: `Deleted ${deleteResult.count} patient records older than 30 days`
    })

  } catch (error) {
    console.error('Admin Cleanup Error:', error)
    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 