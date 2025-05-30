import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    if (!role || !Object.values(Role).includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ error: 'No email address found' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email,
        role: role as Role,
      }
    })

    console.log(`✅ User created: ${email} with role ${role}`)

    return NextResponse.json({
      user: newUser,
      message: 'User setup completed successfully'
    })

  } catch (error) {
    console.error('User setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 