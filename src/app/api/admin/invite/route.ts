import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth'
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { role } = await getCurrentUserRole()
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { emailAddress } = await request.json()
    if (!emailAddress) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    const client = await clerkClient()
    const invitation = await client.invitations.createInvitation({
      emailAddress,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tocdoctor.com'}/sign-up`,
    })

    return NextResponse.json({ invitation: { id: invitation.id, emailAddress } })
  } catch (error: any) {
    console.error('POST /api/admin/invite error:', error)
    if (error?.errors?.[0]?.message) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
  }
}
