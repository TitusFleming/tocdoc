// Client-side auth utilities
'use client'

import { useUser } from '@clerk/nextjs'

export function useUserRole() {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded || !user) {
    return { role: null, email: null, isLoading: !isLoaded }
  }

  const email = user.emailAddresses[0]?.emailAddress
  
  // Check if user is admin based on ADMIN_EMAILS
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
  const isAdmin = email ? adminEmails.includes(email.toLowerCase()) : false
  
  return {
    role: isAdmin ? 'ADMIN' : 'DOCTOR',
    email,
    isLoading: false
  }
}
