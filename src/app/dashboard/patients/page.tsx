'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search, Filter, UserCheck, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: string
  name: string
  dob: string
  facility: string
  diagnosis: string
  admission: string
  discharge: string | null
  notes: string | null
  physician: {
    email: string
  }
  createdAt: string
}

interface ApiResponse {
  patients: Patient[]
  count: number
  userRole: string
  error?: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    fetchPatients()
  }, [filter])

  useEffect(() => {
    // Apply search filter
    if (searchTerm) {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [searchTerm, patients])

  // Listen for global patient data changes
  useEffect(() => {
    const handlePatientDataChange = () => {
      console.log('Patient data changed - refreshing...')
      fetchPatients()
    }

    window.addEventListener('patientDataChanged', handlePatientDataChange)
    
    return () => {
      window.removeEventListener('patientDataChanged', handlePatientDataChange)
    }
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patients?filter=${filter}`)
      const data: ApiResponse = await response.json()
      
      if (response.ok) {
        setPatients(data.patients)
        setUserRole(data.userRole)
      } else {
        console.error('Failed to fetch patients:', data.error)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (patient: Patient) => {
    if (!patient.discharge) {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Currently Admitted</Badge>
    }

    const dischargeDate = new Date(patient.discharge)
    const now = new Date()
    const daysSinceDischarge = Math.floor((now.getTime() - dischargeDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceDischarge <= 7) {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Recently Discharged</Badge>
    }

    return <Badge variant="outline"><UserCheck className="h-3 w-3 mr-1" />Discharged</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Patient List</h1>
          <p className="mt-1 text-sm text-gray-600">
            {userRole === 'ADMIN' ? 'All patients in the system' : 'Your assigned patients'}
            {' '}({filteredPatients.length} total)
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="admitted">Currently Admitted</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
              <SelectItem value="followup">Need Follow-up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Patient Records
          </CardTitle>
          <CardDescription>
            {filter === 'all' && 'All patient records with admission and discharge information'}
            {filter === 'admitted' && 'Patients currently admitted to facilities'}
            {filter === 'discharged' && 'Patients who have been discharged'}
            {filter === 'followup' && 'Recently discharged patients requiring follow-up'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'No patients match your search criteria.' 
                  : `No patients in the ${filter} category.`
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Admission</TableHead>
                  <TableHead>Discharge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{formatDate(patient.dob)}</TableCell>
                    <TableCell>{patient.facility}</TableCell>
                    <TableCell>{patient.diagnosis}</TableCell>
                    <TableCell>{formatDate(patient.admission)}</TableCell>
                    <TableCell>
                      {patient.discharge ? formatDate(patient.discharge) : 'Still admitted'}
                    </TableCell>
                    <TableCell>{getStatusBadge(patient)}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/patients/${patient.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
