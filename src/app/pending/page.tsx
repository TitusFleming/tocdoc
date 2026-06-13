import { UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="text-xl sm:text-2xl font-bold text-[#0369a1] hover:opacity-80 transition-opacity">TOCdoctor.com</a>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Account Pending
            </CardTitle>
            <CardDescription>Your account has not been activated yet</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-3">
            <p>
              Access to TOCdoctor.com is by invitation only. Your sign-in worked, but your
              account has not been set up by an administrator.
            </p>
            <p>
              If you believe this is a mistake, contact your administrator and ask them to
              send you an invitation from the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
