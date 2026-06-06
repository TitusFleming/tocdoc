import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

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

    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (role !== Role.ADMIN) {
      if (event.doctorId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (typeof body.reviewed !== 'boolean' || Object.keys(body).length !== 1) {
        return NextResponse.json({ error: 'Can only update reviewed status' }, { status: 403 })
      }
      const updated = await prisma.event.update({
        where: { id },
        data: { reviewed: body.reviewed },
      })
      return NextResponse.json({ event: updated })
    }

    const {
      status, patientAlias, dobMonthYear, diagnosis, hospitalName,
      admissionDate, admissionTime, dischargeDate, dischargeTime,
      dischargeNotes, doctorId, reviewed,
    } = body

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(patientAlias && { patientAlias }),
        ...(dobMonthYear !== undefined && { dobMonthYear }),
        ...(diagnosis && { diagnosis }),
        ...(hospitalName && { hospitalName }),
        ...(admissionDate && { admissionDate: new Date(admissionDate) }),
        ...(admissionTime !== undefined && { admissionTime }),
        ...(dischargeDate && { dischargeDate: new Date(dischargeDate) }),
        ...(dischargeTime !== undefined && { dischargeTime }),
        ...(dischargeNotes !== undefined && { dischargeNotes }),
        ...(doctorId && { doctorId }),
        ...(typeof reviewed === 'boolean' && { reviewed }),
      },
    })

    return NextResponse.json({ event: updated })
  } catch (error) {
    console.error('PATCH /api/events/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { role } = await getCurrentUserRole()
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await prisma.event.delete({ where: { id } })

    return NextResponse.json({ message: 'Event deleted' })
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
