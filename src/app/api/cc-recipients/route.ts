import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

// GET /api/cc-recipients?doctorId=xxx — get CC list for a doctor
export async function GET(request: NextRequest) {
  try {
    const { role } = await getCurrentUserRole()
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const doctorId = request.nextUrl.searchParams.get('doctorId')
    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId is required' }, { status: 400 })
    }

    const ccList = await prisma.ccRecipient.findMany({
      where: { doctorId },
      include: { user: { select: { id: true, email: true, name: true } } },
    })

    return NextResponse.json({ ccRecipients: ccList.map(cc => cc.user) })
  } catch (error) {
    console.error('GET /api/cc-recipients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cc-recipients — add a user to a doctor's CC list
export async function POST(request: NextRequest) {
  try {
    const { role } = await getCurrentUserRole()
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { doctorId, userId } = await request.json()
    if (!doctorId || !userId) {
      return NextResponse.json({ error: 'doctorId and userId are required' }, { status: 400 })
    }

    const cc = await prisma.ccRecipient.create({
      data: { doctorId, userId },
      include: { user: { select: { id: true, email: true, name: true } } },
    })

    return NextResponse.json({ ccRecipient: cc.user })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'User already in CC list' }, { status: 409 })
    }
    console.error('POST /api/cc-recipients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/cc-recipients — remove a user from a doctor's CC list
export async function DELETE(request: NextRequest) {
  try {
    const { role } = await getCurrentUserRole()
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { doctorId, userId } = await request.json()
    if (!doctorId || !userId) {
      return NextResponse.json({ error: 'doctorId and userId are required' }, { status: 400 })
    }

    await prisma.ccRecipient.delete({
      where: { doctorId_userId: { doctorId, userId } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/cc-recipients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
