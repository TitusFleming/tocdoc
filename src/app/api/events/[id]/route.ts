import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { eventUpdateAdminSchema, reviewedOnlySchema } from '@/lib/validation'

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
      const parsed = reviewedOnlySchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Can only update reviewed status' }, { status: 403 })
      }
      const updated = await prisma.event.update({
        where: { id },
        data: { reviewed: parsed.data.reviewed },
      })
      return NextResponse.json({ event: updated })
    }

    const parsed = eventUpdateAdminSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') },
        { status: 400 }
      )
    }
    const data = parsed.data

    // Reassignment target must be an actual doctor.
    if (data.doctorId) {
      const target = await prisma.user.findUnique({
        where: { id: data.doctorId },
        select: { role: true },
      })
      if (!target || target.role !== Role.DOCTOR) {
        return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 })
      }
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.patientAlias && { patientAlias: data.patientAlias }),
        ...(data.dobMonthYear !== undefined && { dobMonthYear: data.dobMonthYear }),
        ...(data.diagnosis && { diagnosis: data.diagnosis }),
        ...(data.hospitalName && { hospitalName: data.hospitalName }),
        ...(data.admissionDate && { admissionDate: new Date(data.admissionDate) }),
        ...(data.admissionTime !== undefined && { admissionTime: data.admissionTime || null }),
        ...(data.dischargeDate && { dischargeDate: new Date(data.dischargeDate) }),
        ...(data.dischargeTime !== undefined && { dischargeTime: data.dischargeTime || null }),
        ...(data.dischargeNotes !== undefined && { dischargeNotes: data.dischargeNotes }),
        ...(data.doctorId && { doctorId: data.doctorId }),
        ...(typeof data.reviewed === 'boolean' && { reviewed: data.reviewed }),
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
