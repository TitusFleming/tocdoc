import { NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/auth'

export async function GET() {
  try {
    const { role, email } = await getCurrentUserRole()
    
    if (!role) {
      return NextResponse.json({ error: 'User role not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      role,
      email 
    })

  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 