import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

// POST /api/user/onboarding - Complete comprehensive onboarding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      email,
      role,
      phone,
      practice,
      specialty,
      npiNumber,
      licenseNumber,
      department,
      title,
      hospitalAffiliations,
      facilityTaxId,
      officeAddress,
      contactHours,
      emergencyContact,
      timezone,
      language,
      hipaaTraining,
      hipaaTrainingDate,
      hipaaTrainingProvider,
      securityClearance,
      onboardingComplete
    } = body

    // Validate required fields
    if (!userId || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields: userId, email, role' }, { status: 400 })
    }

    // Validate role-specific required fields
    if (role === 'PHYSICIAN') {
      if (!specialty || !npiNumber || !licenseNumber) {
        return NextResponse.json({ 
          error: 'Missing required physician fields: specialty, npiNumber, licenseNumber' 
        }, { status: 400 })
      }
    } else if (role === 'ADMIN') {
      if (!department || !title) {
        return NextResponse.json({ 
          error: 'Missing required administrator fields: department, title' 
        }, { status: 400 })
      }
    }

    // Validate HIPAA training requirement
    if (!hipaaTraining) {
      return NextResponse.json({ 
        error: 'HIPAA training completion is required' 
      }, { status: 400 })
    }

    // Check if user already exists and update or create
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    const userData = {
      email,
      role: role as Role,
      phone: phone || null,
      practice: practice || null,
      specialty: specialty || null,
      npiNumber: npiNumber || null,
      licenseNumber: licenseNumber || null,
      department: department || null,
      title: title || null,
      hospitalAffiliations: hospitalAffiliations || [],
      facilityTaxId: facilityTaxId || null,
      officeAddress: officeAddress || null,
      contactHours: contactHours || null,
      emergencyContact: emergencyContact || null,
      timezone: timezone || 'America/New_York',
      language: language || 'English',
      hipaaTraining: Boolean(hipaaTraining),
      hipaaTrainingDate: hipaaTrainingDate ? new Date(hipaaTrainingDate) : null,
      hipaaTrainingProvider: hipaaTrainingProvider || null,
      securityClearance: securityClearance || null,
      onboardingComplete: Boolean(onboardingComplete),
      onboardingStep: 5, // Completed all steps
      // Store notification preferences as JSON
      notificationPrefs: {
        emailAdmissions: true,
        emailDischarges: true,
        smsAdmissions: false,
        smsDischarges: true,
        immediateNotifications: true,
        timezone: timezone || 'America/New_York',
        language: language || 'English'
      }
    }

    let user
    if (existingUser) {
      // Update existing user
      user = await prisma.user.update({
        where: { email },
        data: userData
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: userData
      })
    }

    console.log(`🎯 ONBOARDING COMPLETED for ${role}: ${email}`)
    console.log(`   ├─ Practice: ${practice}`)
    console.log(`   ├─ Specialty: ${specialty || department}`)
    console.log(`   ├─ Phone: ${phone}`)
    console.log(`   ├─ HIPAA Training: ${hipaaTraining ? 'Completed' : 'Required'}`)
    console.log(`   └─ ID: ${user.id}`)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        practice: user.practice,
        specialty: user.specialty,
        department: user.department,
        onboardingComplete: user.onboardingComplete
      },
      message: 'Onboarding completed successfully'
    })

  } catch (error) {
    console.error('Onboarding API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/user/onboarding - Get current onboarding status
export async function GET(request: NextRequest) {
  try {
    const { user, role, email } = await getCurrentUserRole()
    
    if (!user || !email) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Get user onboarding data from database
    const userData = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        onboardingComplete: true,
        onboardingStep: true,
        phone: true,
        practice: true,
        specialty: true,
        department: true,
        hipaaTraining: true
      }
    })

    if (!userData) {
      return NextResponse.json({ 
        onboardingComplete: false,
        onboardingStep: 1,
        message: 'User not found in database' 
      })
    }

    return NextResponse.json({
      onboardingComplete: userData.onboardingComplete,
      onboardingStep: userData.onboardingStep,
      user: userData
    })

  } catch (error) {
    console.error('Onboarding Status API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 