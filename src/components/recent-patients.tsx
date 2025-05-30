import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import prisma from '@/lib/prisma';
import { getCurrentUserRole } from '@/lib/auth';
import { Role } from '@prisma/client';
import type { Patient, User as PrismaUser } from '@prisma/client';

interface PatientWithPhysician extends Patient {
  physician: PrismaUser;
}

export async function RecentPatients() {
  const { user, role, email } = await getCurrentUserRole();
  
  let patients: PatientWithPhysician[] = [];

  if (!user || !role || !email) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Patient Discharges</CardTitle>
          <CardDescription>Please log in to view patient data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  try {
    if (role === Role.ADMIN) {
      patients = await prisma.patient.findMany({
        include: { physician: true },
        orderBy: { admission: 'desc' },
        take: 10,
      });
    } else if (role === Role.PHYSICIAN) {
      const physician = await prisma.user.findUnique({
        where: { email },
      });
      if (physician) {
        patients = await prisma.patient.findMany({
          where: { physicianId: physician.id },
          include: { physician: true },
          orderBy: { admission: 'desc' },
          take: 10,
        });
      }
    }
  } catch (error) {
    console.error("Failed to fetch patients:", error);
        return (
          <Card>
            <CardHeader>
              <CardTitle>Recent Patient Discharges</CardTitle>
          <CardDescription>Error loading patient data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
            Unable to load patient data. Please try again later.
              </p>
            </CardContent>
          </Card>
        );
    }

  if (!patients.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Patient Discharges</CardTitle>
          <CardDescription>
            {role === Role.ADMIN 
              ? 'No patients in the system yet'
              : `No patients assigned to your account (${email})`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {role === Role.ADMIN 
              ? 'Use the Admin Panel to add patient records to the system.'
              : 'Contact your administrator to get access to patient discharge notifications.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Patient Discharges</CardTitle>
        <CardDescription>
          {role === Role.ADMIN 
            ? 'System-wide patient records for administrative oversight'
            : 'Essential information for transition of care coordination and Medicare Advantage billing'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Admission</TableHead>
                <TableHead>Discharge</TableHead>
                {role === Role.ADMIN && (
                <TableHead className="hidden md:table-cell">Physician</TableHead>
                )}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => {
                const isRecentlyDischarged = patient.discharge && 
                  new Date(patient.discharge) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                
                return (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{new Date(patient.dob).toLocaleDateString()}</TableCell>
                    <TableCell>{patient.facility}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.diagnosis}</Badge>
                    </TableCell>
                    <TableCell>{new Date(patient.admission).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {patient.discharge ? new Date(patient.discharge).toLocaleDateString() : 'Current'}
                    </TableCell>
                    {role === Role.ADMIN && (
                    <TableCell className="hidden md:table-cell">{patient.physician.email}</TableCell>
                    )}
                    <TableCell>
                      {isRecentlyDischarged ? (
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                          Follow-up Due
                        </Badge>
                      ) : patient.discharge ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Discharged
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Admitted
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
