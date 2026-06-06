import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getCurrentUserRole } from '@/lib/auth'
import { Role } from '@prisma/client'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { role } = await getCurrentUserRole()
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const eventId = formData.get('eventId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const blob = await put(`tocdoc/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    if (eventId) {
      await prisma.eventImage.create({
        data: {
          eventId,
          url: blob.url,
          filename: file.name,
          mimeType: file.type,
        },
      })
    }

    return NextResponse.json({ url: blob.url, filename: file.name })
  } catch (error) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
