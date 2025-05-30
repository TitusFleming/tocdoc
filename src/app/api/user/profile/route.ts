import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/user/profile - Get user profile information
export async function GET(request: NextRequest) {
  try {
    const { user, role, email } = await getCurrentUserRole()
    
    if (!user || !email) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Get user data from database
    const userData = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        
        // Basic contact info
        phone: true,
        practice: true,
        
        // Professional info
        specialty: true,
        npiNumber: true,
        licenseNumber: true,
        department: true,
        title: true,
        hospitalAffiliations: true,
        facilityTaxId: true,
        officeAddress: true,
        
        // Preferences
        contactHours: true,
        emergencyContact: true,
        timezone: true,
        language: true,
        notificationPrefs: true,
        
        // Compliance
        hipaaTraining: true,
        hipaaTrainingDate: true,
        hipaaTrainingProvider: true,
        securityClearance: true,
        
        // System fields
        onboardingComplete: true,
        onboardingStep: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!userData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    return NextResponse.json(userData)

  } catch (error) {
    console.error('Profile API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/user/profile - Update user profile information
export async function PUT(request: NextRequest) {
  try {
    const { user, role, email } = await getCurrentUserRole()
    
    if (!user || !email) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const {
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
      securityClearance
    } = body

    // Prepare update data, filtering out undefined values
    const updateData: any = {}
    
    // Basic info
    if (phone !== undefined) updateData.phone = phone || null
    if (practice !== undefined) updateData.practice = practice || null
    
    // Professional info
    if (specialty !== undefined) updateData.specialty = specialty || null
    if (npiNumber !== undefined) updateData.npiNumber = npiNumber || null
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber || null
    if (department !== undefined) updateData.department = department || null
    if (title !== undefined) updateData.title = title || null
    if (hospitalAffiliations !== undefined) updateData.hospitalAffiliations = hospitalAffiliations || []
    if (facilityTaxId !== undefined) updateData.facilityTaxId = facilityTaxId || null
    if (officeAddress !== undefined) updateData.officeAddress = officeAddress || null
    
    // Preferences
    if (contactHours !== undefined) updateData.contactHours = contactHours || null
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact || null
    if (timezone !== undefined) updateData.timezone = timezone || 'America/New_York'
    if (language !== undefined) updateData.language = language || 'English'
    
    // Compliance
    if (hipaaTraining !== undefined) updateData.hipaaTraining = Boolean(hipaaTraining)
    if (hipaaTrainingDate !== undefined) {
      updateData.hipaaTrainingDate = hipaaTrainingDate ? new Date(hipaaTrainingDate) : null
    }
    if (hipaaTrainingProvider !== undefined) updateData.hipaaTrainingProvider = hipaaTrainingProvider || null
    if (securityClearance !== undefined) updateData.securityClearance = securityClearance || null

    // Update notification preferences if timezone or language changed
    if (timezone !== undefined || language !== undefined) {
      const currentUser = await prisma.user.findUnique({
        where: { email },
        select: { notificationPrefs: true }
      })
      
      const currentPrefs = (currentUser?.notificationPrefs as any) || {}
      updateData.notificationPrefs = {
        ...currentPrefs,
        timezone: timezone || currentPrefs.timezone || 'America/New_York',
        language: language || currentPrefs.language || 'English'
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        phone: true,
        practice: true,
        specialty: true,
        npiNumber: true,
        licenseNumber: true,
        department: true,
        title: true,
        hospitalAffiliations: true,
        facilityTaxId: true,
        officeAddress: true,
        contactHours: true,
        emergencyContact: true,
        timezone: true,
        language: true,
        hipaaTraining: true,
        hipaaTrainingDate: true,
        hipaaTrainingProvider: true,
        securityClearance: true,
        updatedAt: true,
      }
    })

    console.log(`📝 PROFILE UPDATED for ${role}: ${email}`)
    console.log(`   ├─ Practice: ${updatedUser.practice}`)
    console.log(`   ├─ Phone: ${updatedUser.phone}`)
    console.log(`   └─ Professional: ${updatedUser.specialty || updatedUser.department}`)

    return NextResponse.json({
      user: updatedUser,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile Update API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 