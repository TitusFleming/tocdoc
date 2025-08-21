import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getCurrentUserRole, requireDoctor } from '@/lib/auth'
import { MarkReviewedButton } from '@/components/mark-reviewed-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserButton } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default async function DoctorPage() {
  try {
    // Server-side role enforcement - throws if not doctor
    await requireDoctor()
  } catch (error) {
    // Not authorized - redirect to admin dashboard
    redirect('/admin')
  }

  // Get current user info after role validation
  const { userId, email } = await getCurrentUserRole()
  
  if (!userId || !email) {
    redirect('/sign-in')
  }

  // Fetch events for this doctor
  const events = await prisma.event.findMany({
    where: { doctorId: userId },
    orderBy: { admissionDate: 'desc' }
  })

  const currentAdmissions = events.filter(e => e.status === 'ADMITTED')
  const dischargedPatients = events.filter(e => e.status === 'DISCHARGED')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <a href="/" className="text-xl sm:text-2xl font-bold text-[var(--primary-color,#0369a1)] hover:opacity-80 transition-opacity">TOCdoctor.com</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px] sm:max-w-none">{email}</div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>
      
      {/* Main content with responsive container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Page title with responsive sizing */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Doctor Dashboard</h1>
          </div>

          {/* Responsive tabs */}
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="current" className="flex-1 sm:flex-none">
                <span className="hidden sm:inline">Current Patients</span>
                <span className="sm:hidden">Current</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 sm:flex-none">
                <span className="hidden sm:inline">Discharge History</span>
                <span className="sm:hidden">History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Current Patients</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Patients currently under your care</CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-6">
                  {/* Mobile-friendly responsive table */}
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">Patient</TableHead>
                          <TableHead className="hidden sm:table-cell min-w-[80px]">DOB</TableHead>
                          <TableHead className="min-w-[120px]">Diagnosis</TableHead>
                          <TableHead className="hidden md:table-cell min-w-[120px]">Hospital</TableHead>
                          <TableHead className="min-w-[90px]">Admitted</TableHead>
                          <TableHead className="min-w-[120px] text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentAdmissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-sm sm:text-base">No patients currently admitted</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentAdmissions.map((event) => (
                            <TableRow key={event.id} className={`${event.reviewed ? 'bg-green-50' : ''} hover:bg-gray-50`}>
                              <TableCell className="font-medium">
                                <div className="space-y-1">
                                  <div className="text-sm font-semibold">{event.patientAlias}</div>
                                  <div className="sm:hidden text-xs text-gray-500">
                                    DOB: {event.dobMonthYear || 'N/A'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-sm">
                                {event.dobMonthYear || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">{event.diagnosis}</div>
                                  <div className="md:hidden text-xs text-gray-500">
                                    {event.hospitalName}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm">
                                {event.hospitalName}
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(event.admissionDate).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: new Date(event.admissionDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <MarkReviewedButton eventId={event.id} reviewed={event.reviewed} />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Discharge History</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Previously discharged patients</CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-6">
                  {/* Mobile-friendly responsive table */}
                  <div className="overflow-x-auto">
                    <Table className="min-w-[700px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">Patient</TableHead>
                          <TableHead className="hidden sm:table-cell min-w-[80px]">DOB</TableHead>
                          <TableHead className="min-w-[120px]">Diagnosis</TableHead>
                          <TableHead className="hidden md:table-cell min-w-[120px]">Hospital</TableHead>
                          <TableHead className="min-w-[90px]">Admitted</TableHead>
                          <TableHead className="min-w-[90px]">Discharged</TableHead>
                          <TableHead className="min-w-[80px] text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dischargedPatients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-sm sm:text-base">No discharge history</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          dischargedPatients.map((event) => (
                            <TableRow key={event.id} className={`${event.reviewed ? 'bg-green-50' : 'bg-blue-50'} hover:bg-gray-50`}>
                              <TableCell className="font-medium">
                                <div className="space-y-1">
                                  <div className="text-sm font-semibold">{event.patientAlias}</div>
                                  <div className="sm:hidden text-xs text-gray-500">
                                    DOB: {event.dobMonthYear || 'N/A'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-sm">
                                {event.dobMonthYear || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">{event.diagnosis}</div>
                                  <div className="md:hidden text-xs text-gray-500">
                                    {event.hospitalName}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm">
                                {event.hospitalName}
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(event.admissionDate).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: new Date(event.admissionDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </TableCell>
                              <TableCell className="text-sm">
                                {event.dischargeDate ? new Date(event.dischargeDate).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: new Date(event.dischargeDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                }) : 'N/A'}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Discharged
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}