import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentPatients } from "@/components/recent-patients"
import { DashboardStats } from "@/components/dashboard-stats"
import { NotificationSettings } from "@/components/notification-settings"
import { getCurrentUserRole } from "@/lib/auth"
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { user, role, email } = await getCurrentUserRole()
  
  if (!user) {
    redirect('/sign-in')
  }

  if (!role || !email) {
    redirect('/onboarding')
  }

  // Fetch data for DashboardStats based on user role
  let totalPatients = 0
  let recentAdmissions = 0
  let recentDischarges = 0
  let followUpRequired = 0

  try {
    let physicianWhereClause = {}

    if (role === Role.PHYSICIAN) {
      const physician = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      })
      if (physician) {
        physicianWhereClause = { physicianId: physician.id }
      } else {
        physicianWhereClause = { physicianId: "non_existent_user_for_zero_counts" }
      }
    }
    // If admin, physicianWhereClause remains empty, fetching for all

    totalPatients = await prisma.patient.count({ where: physicianWhereClause })

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    recentAdmissions = await prisma.patient.count({
      where: {
        ...physicianWhereClause,
        admission: { gte: sevenDaysAgo },
      },
    })

    recentDischarges = await prisma.patient.count({
      where: {
        ...physicianWhereClause,
        discharge: { gte: sevenDaysAgo }, 
      },
    })
    
    // Calculate follow-up required based on recently discharged patients
    if (role === Role.ADMIN) {
        followUpRequired = Math.ceil(recentDischarges * 0.1) // Admin sees small portion globally
    } else {
        followUpRequired = Math.ceil(recentDischarges * 0.3) // Physicians see fraction of their discharges
    }

  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    totalPatients = 0
    recentAdmissions = 0
    recentDischarges = 0
    followUpRequired = 0
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {role === Role.ADMIN ? 'Administrator Dashboard' : 'Physician Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {role === Role.ADMIN 
            ? `System administration and patient management for ${email}`
            : `Hospital discharge notifications and transition of care management for ${email}`
          }
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Recent Patients</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {role === Role.ADMIN && (
            <TabsTrigger value="admin">Admin Tools</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DashboardStats 
            totalPatients={totalPatients}
            recentAdmissions={recentAdmissions}
            recentDischarges={recentDischarges}
            followUpRequired={followUpRequired}
          />

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Discharge Activity</CardTitle>
              <CardDescription>
                {role === Role.ADMIN 
                  ? 'System-wide patient admission and discharge activity in the last 7 days.'
                  : 'Your patient admission and discharge activity in the last 7 days for transition of care coordination.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full rounded-md border p-4">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Activity chart will display here</p>
                    <p className="text-xs text-muted-foreground">
                      {role === Role.ADMIN 
                        ? 'Track system-wide admission/discharge patterns'
                        : 'Track admissions/discharges for Medicare Advantage bonus eligibility'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <RecentPatients />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discharge Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications about patient admissions and discharges (no PHI in notifications).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>

        {role === Role.ADMIN && (
          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Administrator Tools</CardTitle>
                <CardDescription>
                  Access advanced system management features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-muted-foreground mb-4">
                    Administrator functions are available in the dedicated admin panel.
                  </p>
                  <a 
                    href="/dashboard/admin" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Go to Admin Panel
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
