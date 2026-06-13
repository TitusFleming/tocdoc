import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'
import { Role } from '@prisma/client'
import prisma from '@/lib/prisma'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
// Vercel serverless functions reject request bodies over ~4.5MB.
const MAX_SIZE = 4 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const { role } = await getCurrentUserRole()
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const eventId = formData.get('eventId') as string | null

    if (!file || !eventId) {
      return NextResponse.json({ error: 'file and eventId are required' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 400 })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())

    const image = await prisma.eventImage.create({
      data: {
        eventId,
        data: bytes,
        filename: file.name,
        mimeType: file.type,
      },
      select: { id: true, filename: true },
    })

    return NextResponse.json({ id: image.id, filename: image.filename })
  } catch (error) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
