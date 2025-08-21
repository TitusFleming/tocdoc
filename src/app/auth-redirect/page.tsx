import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

// Check if email is admin (inline function to avoid server/client boundary issues)
function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@tocdoc.com')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

export default async function AuthRedirect() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    redirect('/sign-in')
  }
  
  const email = clerkUser.emailAddresses[0]?.emailAddress
  if (!email) {
    redirect('/sign-in')
  }

  const isAdmin = isAdminEmail(email)
  
  if (isAdmin) {
    redirect('/admin')
  } else {
    redirect('/doctor')
  }
}
