import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserRole } from '@/lib/auth'
import { Role } from '@prisma/client'

// GET /api/patients - Fetch patients based on user role
export async function GET(request: NextRequest) {
  try {
    const { role, email } = await getCurrentUserRole()
    
    if (!role || !email) {
      return NextResponse.json({ error: 'User not authenticated or role not set' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'all'

    let whereClause: any = {}

    // Role-based access control
    if (role === Role.PHYSICIAN) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

      whereClause.physicianId = user.id
    }
    // ADMIN sees all patients (no additional where clause)

    // Apply filters
    if (filter === 'admitted') {
      whereClause.discharge = null
    } else if (filter === 'discharged') {
      whereClause.discharge = { not: null }
    } else if (filter === 'followup') {
      // Recently discharged (within 7 days) 
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      whereClause.discharge = { 
        gte: sevenDaysAgo,
        not: null 
      }
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
      include: {
        physician: {
          select: { email: true }
        }
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    })

    return NextResponse.json({ 
      patients,
      count: patients.length,
      userRole: role 
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/patients - Create new patient (Admin only)
export async function POST(request: NextRequest) {
  try {
    const { role, email } = await getCurrentUserRole()
    
    if (!role || !email) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      name, 
      dob, 
      facility, 
      diagnosis, 
      admission, 
      discharge, 
      notes, 
      physicianEmail
    } = body

    // Find the assigned physician
    const physician = await prisma.user.findUnique({
      where: { email: physicianEmail },
    })

    if (!physician || physician.role !== Role.PHYSICIAN) {
      return NextResponse.json({ error: 'Physician not found' }, { status: 404 })
    }

    // Create patient record
    const patient = await prisma.patient.create({
      data: {
        name,
        dob: new Date(dob),
        facility,
        diagnosis,
        admission: new Date(admission),
        discharge: discharge ? new Date(discharge) : null,
        notes,
        physicianId: physician.id,
      },
      include: {
        physician: {
          select: { email: true }
        }
      }
    })

    // Trigger notification (admission or discharge)
    await triggerNotification(patient, discharge ? 'discharge' : 'admission')

    return NextResponse.json({ 
      patient,
      message: 'Patient created successfully'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to trigger notifications
async function triggerNotification(patient: any, type: 'admission' | 'discharge') {
  try {
    // This would integrate with your notification service (SendGrid, Twilio, etc.)
    console.log(`🔔 NOTIFICATION TRIGGERED:`)
    console.log(`Type: ${type}`)
    console.log(`Patient: ${patient.name} (ID: ${patient.id})`)
    console.log(`Physician: ${patient.physician.email}`)
    console.log(`Facility: ${patient.facility}`)
    console.log(`Message: "A patient assigned to your practice has been ${type === 'admission' ? 'admitted' : 'discharged'}"`)
    
    // TODO: Implement actual email/SMS sending
    // await sendNotificationEmail(patient.physician.email, type, patient.facility)
    // await sendNotificationSMS(physicianPhone, type)
    
  } catch (error) {
    console.error('Notification failed:', error)
  }
} 