import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getCurrentUserRole, requireDoctor } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserButton } from '@clerk/nextjs'
import { MarkReviewedButton } from '@/components/mark-reviewed-button'
import { PrintButton } from '@/components/print-button'

export const dynamic = 'force-dynamic'

export default async function DoctorPage() {
  try {
    await requireDoctor()
  } catch {
    redirect('/admin')
  }

  const { userId, email } = await getCurrentUserRole()
  if (!userId || !email) {
    redirect('/sign-in')
  }

  const events = await prisma.event.findMany({
    where: { doctorId: userId },
    orderBy: { admissionDate: 'desc' },
    include: {
      images: { select: { id: true, url: true, filename: true } },
    },
  })

  const currentAdmissions = events.filter(e => e.status === 'ADMITTED')
  const dischargedPatients = events.filter(e => e.status === 'DISCHARGED')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="text-xl sm:text-2xl font-bold text-[#0369a1] hover:opacity-80 transition-opacity">TOCdoctor.com</a>
          <div className="flex items-center gap-4">
            <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px]">{email}</div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-6">Doctor Dashboard</h1>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="current" className="flex-1 sm:flex-none">
              Current Patients ({currentAdmissions.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 sm:flex-none">
              Discharge History ({dischargedPatients.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Patients</CardTitle>
                <CardDescription>Patients currently under your care</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead className="hidden sm:table-cell">DOB</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead className="hidden md:table-cell">Hospital</TableHead>
                        <TableHead>Admitted</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAdmissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            No patients currently admitted
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentAdmissions.map((event) => (
                          <TableRow key={event.id} className={event.reviewed ? 'bg-green-50' : ''}>
                            <TableCell className="font-medium">
                              <div className="text-sm font-semibold">{event.patientAlias}</div>
                              <div className="sm:hidden text-xs text-gray-500">DOB: {event.dobMonthYear || 'N/A'}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{event.dobMonthYear || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="text-sm">{event.diagnosis}</div>
                              <div className="md:hidden text-xs text-gray-500">{event.hospitalName}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm">{event.hospitalName}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(event.admissionDate).toLocaleDateString()}
                              {event.admissionTime && <div className="text-xs text-gray-500">{event.admissionTime}</div>}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <MarkReviewedButton eventId={event.id} reviewed={event.reviewed} />
                                <PrintButton event={{
                                  patientAlias: event.patientAlias,
                                  dobMonthYear: event.dobMonthYear,
                                  diagnosis: event.diagnosis,
                                  hospitalName: event.hospitalName,
                                  admissionDate: event.admissionDate.toISOString(),
                                  admissionTime: event.admissionTime,
                                  status: event.status,
                                }} />
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
                <CardTitle>Discharge History</CardTitle>
                <CardDescription>Previously discharged patients</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="space-y-4">
                  {dischargedPatients.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No discharge history</p>
                  ) : (
                    dischargedPatients.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4 bg-white">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                          <div className="border rounded p-2 bg-gray-50">
                            <div className="text-xs font-semibold text-gray-500 uppercase">Patient</div>
                            <div className="font-semibold mt-1">{event.patientAlias}</div>
                          </div>
                          <div className="border rounded p-2 bg-gray-50">
                            <div className="text-xs font-semibold text-gray-500 uppercase">DOB</div>
                            <div className="text-sm mt-1">{event.dobMonthYear || 'N/A'}</div>
                          </div>
                          <div className="border rounded p-2 bg-gray-50">
                            <div className="text-xs font-semibold text-gray-500 uppercase">Hospital</div>
                            <div className="text-sm mt-1">{event.hospitalName}</div>
                          </div>
                          <div className="border rounded p-2 bg-gray-50">
                            <div className="text-xs font-semibold text-gray-500 uppercase">Admitted</div>
                            <div className="text-sm mt-1">{new Date(event.admissionDate).toLocaleDateString()}</div>
                          </div>
                          <div className="border rounded p-2 bg-gray-50">
                            <div className="text-xs font-semibold text-gray-500 uppercase">Discharged</div>
                            <div className="text-sm mt-1">
                              {event.dischargeDate ? new Date(event.dischargeDate).toLocaleDateString() : 'N/A'}
                              {event.dischargeTime && <span className="text-gray-500 ml-1">{event.dischargeTime}</span>}
                            </div>
                          </div>
                          <div className="border rounded p-2 bg-gray-50">
                            <div className="text-xs font-semibold text-gray-500 uppercase">Status</div>
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Discharged
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded p-3 bg-gray-50 mb-3">
                          <div className="text-xs font-semibold text-gray-500 uppercase">Diagnosis</div>
                          <div className="text-sm mt-1">{event.diagnosis}</div>
                        </div>

                        {event.dischargeNotes && (
                          <div className="border rounded p-3 bg-yellow-50 mb-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase">Discharge Notes</div>
                            <div className="text-sm mt-1 whitespace-pre-wrap">{event.dischargeNotes}</div>
                          </div>
                        )}

                        {event.images.length > 0 && (
                          <div className="border rounded p-3 bg-gray-50 mb-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Attached Images</div>
                            <div className="flex flex-wrap gap-2">
                              {event.images.map(img => (
                                <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer">
                                  <img src={img.url} alt={img.filename || 'Attachment'} className="h-24 w-24 object-cover rounded border hover:opacity-80 transition" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <PrintButton event={{
                            patientAlias: event.patientAlias,
                            dobMonthYear: event.dobMonthYear,
                            diagnosis: event.diagnosis,
                            hospitalName: event.hospitalName,
                            admissionDate: event.admissionDate.toISOString(),
                            admissionTime: event.admissionTime,
                            dischargeDate: event.dischargeDate?.toISOString(),
                            dischargeTime: event.dischargeTime,
                            dischargeNotes: event.dischargeNotes,
                            status: event.status,
                          }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
