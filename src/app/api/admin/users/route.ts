import { NextResponse } from 'next/server'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { isAdminEmail } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

// GET /api/admin/users - Get list of doctors (admin only)
export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email || !isAdminEmail(email)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Get all doctors from database
    const dbDoctors = await prisma.user.findMany({
      where: { role: Role.DOCTOR },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
      orderBy: { email: 'asc' }
    })

    // Get user details from Clerk for each doctor
    const doctors = await Promise.all(
      dbDoctors.map(async (doctor) => {
        try {
          // Find Clerk user by email
          const client = await clerkClient()
          const clerkUsers = await client.users.getUserList({
            emailAddress: [doctor.email]
          })
          
          const clerkUser = clerkUsers.data[0]
          return {
            ...doctor,
            firstName: clerkUser?.firstName || null,
            lastName: clerkUser?.lastName || null,
          }
        } catch (error) {
          console.error(`Error fetching Clerk data for ${doctor.email}:`, error)
          return {
            ...doctor,
            firstName: null,
            lastName: null,
          }
        }
      })
    )

    return NextResponse.json({ doctors })
  } catch (error) {
    console.error('GET /api/admin/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}