import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Redirect to the auth-redirect page which will handle role-based routing
  redirect('/auth-redirect')
}