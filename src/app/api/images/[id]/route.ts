import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

// GET /api/images/[id] - Serve an event image to the admin or the owning doctor only
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { role, userId } = await getCurrentUserRole()
    if (!role || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const image = await prisma.eventImage.findUnique({
      where: { id },
      include: { event: { select: { doctorId: true } } },
    })

    if (!image) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (role !== Role.ADMIN && image.event.doctorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return new NextResponse(Buffer.from(image.data), {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `inline; filename="${(image.filename || 'image').replace(/[^\w.\-]/g, '_')}"`,
      },
    })
  } catch (error) {
    console.error('GET /api/images/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
