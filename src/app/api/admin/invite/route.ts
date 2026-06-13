import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { inviteSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const { role } = await getCurrentUserRole()
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const parsed = inviteSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
    }
    const emailAddress = parsed.data.emailAddress.toLowerCase()

    // Provision the doctor account; sign-ins without a row here land on /pending.
    await prisma.user.upsert({
      where: { email: emailAddress },
      update: {},
      create: { email: emailAddress, role: Role.DOCTOR },
    })

    const client = await clerkClient()
    await client.invitations.createInvitation({
      emailAddress,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tocdoctor.com'}/sign-up`,
    })

    return NextResponse.json({ invited: emailAddress })
  } catch (error) {
    console.error('POST /api/admin/invite error:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation. The email may already be invited or registered.' },
      { status: 400 }
    )
  }
}
