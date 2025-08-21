import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

// PATCH /api/events/[id] - Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { role, userId } = await getCurrentUserRole()
    if (!role || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Get existing event
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        patientAlias: true,
        diagnosis: true,
        hospitalName: true,
        admissionDate: true,
        dischargeDate: true,
        reviewed: true,
        createdAt: true,
        doctorId: true
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Non-admins can only update their own events' reviewed status
    if (role !== Role.ADMIN) {
      if (event.doctorId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Only allow updating reviewed status
      if (typeof body.reviewed !== 'boolean' || Object.keys(body).length !== 1) {
        return NextResponse.json({ error: 'Can only update reviewed status' }, { status: 403 })
      }

      const updated = await prisma.event.update({
        where: { id },
        data: { reviewed: body.reviewed }
      })

      return NextResponse.json({ event: updated })
    }

    // Admins can update any field
    const {
      status,
      patientAlias,
      dobMonthYear,
      diagnosis,
      hospitalName,
      admissionDate,
      dischargeDate,
      doctorId,
      reviewed
    } = body

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(patientAlias && { patientAlias }),
        ...(dobMonthYear && { dobMonthYear }),
        ...(diagnosis && { diagnosis }),
        ...(hospitalName && { hospitalName }),
        ...(admissionDate && { admissionDate: new Date(admissionDate) }),
        ...(dischargeDate && { dischargeDate: new Date(dischargeDate) }),
        ...(doctorId && { doctorId }),
        ...(typeof reviewed === 'boolean' && { reviewed })
      }
    })

    return NextResponse.json({ event: updated })
  } catch (error) {
    console.error('PATCH /api/events/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/events/[id] - Delete event (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { role } = await getCurrentUserRole()
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { id } = await params
    await prisma.event.delete({ where: { id } })

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}