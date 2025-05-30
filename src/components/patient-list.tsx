"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileText, Calendar, Phone, AlertCircle } from "lucide-react"

// Mock patient data
const patients = [
  {
    id: "P001",
    name: "John Smith",
    dob: "05/12/1965",
    facility: "Memorial Hospital",
    admissionDate: "05/15/2023",
    dischargeDate: "05/22/2023",
    diagnosis: "Congestive Heart Failure",
    status: "discharged",
    needsFollowup: true,
  },
  {
    id: "P002",
    name: "Mary Johnson",
    dob: "08/23/1972",
    facility: "St. Luke's Medical Center",
    admissionDate: "05/18/2023",
    dischargeDate: "05/24/2023",
    diagnosis: "Pneumonia",
    status: "discharged",
    needsFollowup: false,
  },
  {
    id: "P003",
    name: "Robert Davis",
    dob: "11/04/1958",
    facility: "Memorial Hospital",
    admissionDate: "05/20/2023",
    dischargeDate: null,
    diagnosis: "COPD Exacerbation",
    status: "admitted",
    needsFollowup: false,
  },
  {
    id: "P004",
    name: "Patricia Wilson",
    dob: "02/17/1945",
    facility: "University Medical Center",
    admissionDate: "05/19/2023",
    dischargeDate: "05/23/2023",
    diagnosis: "Stroke",
    status: "discharged",
    needsFollowup: true,
  },
  {
    id: "P005",
    name: "James Brown",
    dob: "07/30/1980",
    facility: "St. Luke's Medical Center",
    admissionDate: "05/21/2023",
    dischargeDate: null,
    diagnosis: "Diabetic Ketoacidosis",
    status: "admitted",
    needsFollowup: false,
  },
  {
    id: "P006",
    name: "Jennifer Miller",
    dob: "03/14/1975",
    facility: "Memorial Hospital",
    admissionDate: "05/17/2023",
    dischargeDate: "05/25/2023",
    diagnosis: "Acute Pancreatitis",
    status: "discharged",
    needsFollowup: true,
  },
  {
    id: "P007",
    name: "Michael Wilson",
    dob: "09/22/1962",
    facility: "University Medical Center",
    admissionDate: "05/22/2023",
    dischargeDate: null,
    diagnosis: "Pneumonia",
    status: "admitted",
    needsFollowup: false,
  },
]

interface PatientListProps {
  filter: "all" | "admitted" | "discharged" | "followup"
}

export function PatientList({ filter }: PatientListProps) {
  // Filter patients based on the selected tab
  const filteredPatients = patients.filter((patient) => {
    if (filter === "all") return true
    if (filter === "admitted") return patient.status === "admitted"
    if (filter === "discharged") return patient.status === "discharged"
    if (filter === "followup") return patient.needsFollowup
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {filter === "all" && "All Patients"}
          {filter === "admitted" && "Currently Admitted Patients"}
          {filter === "discharged" && "Recently Discharged Patients"}
          {filter === "followup" && "Patients Needing Follow-up"}
        </CardTitle>
        <CardDescription>
          {filter === "all" && "View all patients in your care."}
          {filter === "admitted" && "Patients currently admitted to a hospital."}
          {filter === "discharged" && "Patients recently discharged from a hospital."}
          {filter === "followup" && "Patients who require follow-up care."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Admission Date</TableHead>
              <TableHead>Discharge Date</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">DOB: {patient.dob}</div>
                      </div>
                      {patient.needsFollowup && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Follow-up
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{patient.facility}</TableCell>
                  <TableCell>{patient.admissionDate}</TableCell>
                  <TableCell>{patient.dischargeDate || "—"}</TableCell>
                  <TableCell>{patient.diagnosis}</TableCell>
                  <TableCell>
                    <Badge
                      variant={patient.status === "admitted" ? "outline" : "default"}
                      className={
                        patient.status === "admitted"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : "bg-green-100 text-green-800 hover:bg-green-100"
                      }
                    >
                      {patient.status === "admitted" ? "Admitted" : "Discharged"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/patients/${patient.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Follow-up
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Contact Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredPatients.length} of {patients.length} patients
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
