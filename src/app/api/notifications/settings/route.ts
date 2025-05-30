import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/notifications/settings - Get user notification preferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userEmail = searchParams.get('userEmail') || 'dr.smith@hospital.com'

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For demo purposes, return default settings
    // In production, you'd have a NotificationSettings model
    const defaultSettings = {
      emailAdmissions: true,
      emailDischarges: true,
      smsAdmissions: false,
      smsDischarges: true,
      immediateNotifications: true,
      userId: user.id,
      userEmail: user.email
    }

    return NextResponse.json(defaultSettings)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notifications/settings - Update notification preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userEmail,
      emailAdmissions,
      emailDischarges,
      smsAdmissions,
      smsDischarges,
      immediateNotifications
    } = body

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // In production, you would save these to a NotificationSettings table
    console.log(`📧 NOTIFICATION SETTINGS UPDATED for ${userEmail}:`)
    console.log(`- Email Admissions: ${emailAdmissions}`)
    console.log(`- Email Discharges: ${emailDischarges}`)
    console.log(`- SMS Admissions: ${smsAdmissions}`)
    console.log(`- SMS Discharges: ${smsDischarges}`)
    console.log(`- Immediate Notifications: ${immediateNotifications}`)

    const updatedSettings = {
      emailAdmissions,
      emailDischarges,
      smsAdmissions,
      smsDischarges,
      immediateNotifications,
      userId: user.id,
      userEmail: user.email,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ 
      settings: updatedSettings,
      message: 'Notification settings updated successfully'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 