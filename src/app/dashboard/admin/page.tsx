'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Users, UserPlus, Trash2, Calendar, Database, Shield } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

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
    id: string
    email: string
    role: string
  }
  createdAt: string
}

interface Physician {
  id: string
  email: string
  patientCount: number
}

interface AdminStats {
  total: number
  currentlyAdmitted: number
  recentlyDischarged: number
  needingDeletion: number
}

export default function AdminPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [physicians, setPhysicians] = useState<Physician[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPhysician, setSelectedPhysician] = useState('')
  const [message, setMessage] = useState('')

  // New patient form
  const [newPatient, setNewPatient] = useState({
    name: '',
    dob: '',
    facility: '',
    diagnosis: '',
    admission: '',
    discharge: '',
    notes: '',
    physicianEmail: ''
  })

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/patients`)
      const data = await response.json()
      
      if (response.ok) {
        setPatients(data.patients)
        setPhysicians(data.physicians)
        setStats(data.stats)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to fetch admin data')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic front-end validation
    if (!newPatient.name || !newPatient.dob || !newPatient.facility || !newPatient.diagnosis || !newPatient.admission || !newPatient.physicianEmail) {
      setMessage('❌ Please fill out all required fields: Name, Date of Birth, Facility, Diagnosis, Admission Date, and Physician')
      return
    }

    try {
      const response = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patients: [newPatient] // Send as array for batch processing
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        if (data.errors && data.errors.length > 0) {
          setMessage(`⚠️ Patient created with issues: ${data.errors[0]}`)
        } else {
          setMessage(`✅ Successfully created patient: ${newPatient.name}`)
        }
        setNewPatient({
          name: '', dob: '', facility: '', diagnosis: '', 
          admission: '', discharge: '', notes: '', physicianEmail: ''
        })
        fetchAdminData() // Refresh admin data
        
        // Trigger a global refresh event for other dashboard components
        window.dispatchEvent(new CustomEvent('patientDataChanged'))
        
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to create patient')
      console.error('Error:', error)
    }
  }

  const cleanupExpiredRecords = async () => {
    try {
      const response = await fetch(`/api/admin/patients`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage(`🗑️ HIPAA Cleanup: Deleted ${data.deleted} expired records`)
        fetchAdminData() // Refresh data
      } else {
        setMessage(`❌ Cleanup failed: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Cleanup operation failed')
      console.error('Error:', error)
    }
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
          <p className="mt-2 text-sm text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage TOCdoc system patients and HIPAA compliance
          </p>
        </div>
      </div>

      {message && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Currently Admitted</p>
                  <p className="text-2xl font-bold text-red-600">{stats.currentlyAdmitted}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Discharges</p>
                  <p className="text-2xl font-bold text-green-600">{stats.recentlyDischarged}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Need Deletion</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.needingDeletion}</p>
                </div>
                <Trash2 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Patient */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Add New Patient
            </CardTitle>
            <CardDescription>
              Manually enter patient admission/discharge data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Patient Name *</Label>
                  <Input
                    id="name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newPatient.dob}
                    onChange={(e) => setNewPatient({...newPatient, dob: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facility">Facility *</Label>
                  <Input
                    id="facility"
                    value={newPatient.facility}
                    onChange={(e) => setNewPatient({...newPatient, facility: e.target.value})}
                    placeholder="Main Hospital"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="physician">Assigned Physician *</Label>
                  <Select value={newPatient.physicianEmail} onValueChange={(value) => setNewPatient({...newPatient, physicianEmail: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select physician" />
                    </SelectTrigger>
                    <SelectContent>
                      {physicians.map((physician) => (
                        <SelectItem key={physician.id} value={physician.email}>
                          {physician.email} ({physician.patientCount} patients)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Input
                  id="diagnosis"
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({...newPatient, diagnosis: e.target.value})}
                  placeholder="Hypertension"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admission">Admission Date * (cannot be future)</Label>
                  <Input
                    id="admission"
                    type="datetime-local"
                    value={newPatient.admission}
                    onChange={(e) => setNewPatient({...newPatient, admission: e.target.value})}
                    max={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discharge">Discharge Date (future = still admitted)</Label>
                  <Input
                    id="discharge"
                    type="datetime-local"
                    value={newPatient.discharge}
                    onChange={(e) => setNewPatient({...newPatient, discharge: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newPatient.notes}
                  onChange={(e) => setNewPatient({...newPatient, notes: e.target.value})}
                  placeholder="Additional notes about treatment, follow-up requirements, etc."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Patient Record
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* HIPAA Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              HIPAA Compliance
            </CardTitle>
            <CardDescription>
              Manage 30-day record retention policy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Record Retention Policy</h4>
              <p className="text-sm text-blue-700">
                Patient records are automatically marked for deletion 30 days after discharge.
                Currently {stats?.needingDeletion || 0} records need deletion.
              </p>
            </div>

            <Button 
              onClick={cleanupExpiredRecords}
              variant="outline"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clean Up Expired Records (30+ days)
            </Button>

            <div className="space-y-2">
              <h4 className="font-medium">Physician Summary</h4>
              {physicians.map((physician) => (
                <div key={physician.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">{physician.email}</span>
                  <Badge variant="outline">{physician.patientCount} patients</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            All Patients ({patients.length})
          </CardTitle>
          <CardDescription>
            Complete system view of all patient records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Admission</TableHead>
                <TableHead>Discharge</TableHead>
                <TableHead>Physician</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.slice(0, 10).map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.facility}</TableCell>
                  <TableCell>{patient.diagnosis}</TableCell>
                  <TableCell>{formatDate(patient.admission)}</TableCell>
                  <TableCell>
                    {patient.discharge ? formatDate(patient.discharge) : 'Still admitted'}
                  </TableCell>
                  <TableCell>{patient.physician.email}</TableCell>
                  <TableCell>
                    {!patient.discharge ? (
                      <Badge variant="destructive">Admitted</Badge>
                    ) : (
                      <Badge variant="outline">Discharged</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 