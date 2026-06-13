import { redirect } from 'next/navigation'
import { getCurrentUserRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AuthRedirect() {
  const { user, role } = await getCurrentUserRole()

  if (!user) {
    redirect('/sign-in')
  }

  if (role === 'ADMIN') {
    redirect('/admin')
  } else if (role === 'DOCTOR') {
    redirect('/doctor')
  } else {
    redirect('/pending')
  }
}
