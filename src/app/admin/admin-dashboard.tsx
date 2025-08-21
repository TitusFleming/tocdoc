'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, UserPlus, Calendar, Hospital, X } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Doctor {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface Patient {
  id: string
  patientAlias: string
  dobMonthYear?: string
  diagnosis: string
  hospitalName: string
  admissionDate: string
  reviewed: boolean
  createdAt: string
}

interface AdminDashboardProps {
  doctors: Doctor[]
}

export function AdminDashboard({ doctors }: AdminDashboardProps) {
  const { user } = useUser()
  const [message, setMessage] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [admittedPatients, setAdmittedPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [showNewAdmissionForm, setShowNewAdmissionForm] = useState(false)

  const [newEvent, setNewEvent] = useState({
    patientName: '',
    dobMonthYear: '',
    eventType: '', // 'ADMIT' or 'DISCHARGE'
    hospitalFacility: '',
    eventDate: '',
    additionalNotes: ''
  })

  // Common hospital/facility acronyms for dropdown
  const hospitalAcronyms = [
    { value: 'MGH', label: 'MGH - Massachusetts General Hospital' },
    { value: 'BWH', label: 'BWH - Brigham and Women\'s Hospital' },
    { value: 'BCH', label: 'BCH - Boston Children\'s Hospital' },
    { value: 'BMC', label: 'BMC - Boston Medical Center' },
    { value: 'BIDMC', label: 'BIDMC - Beth Israel Deaconess Medical Center' },
    { value: 'DHMC', label: 'DHMC - Dartmouth-Hitchcock Medical Center' },
    { value: 'YNHH', label: 'YNHH - Yale New Haven Hospital' },
    { value: 'HUP', label: 'HUP - Hospital of the University of Pennsylvania' },
    { value: 'CHOP', label: 'CHOP - Children\'s Hospital of Philadelphia' },
    { value: 'OTHER', label: 'Other - Specify in notes' }
  ]

  // Load patients when doctor is selected
  useEffect(() => {
    if (selectedDoctorId) {
      loadPatientsForDoctor(selectedDoctorId)
    } else {
      setAdmittedPatients([])
    }
  }, [selectedDoctorId])

  const loadPatientsForDoctor = async (doctorId: string) => {
    try {
      setLoadingPatients(true)
      const response = await fetch(`/api/doctors/${doctorId}/patients`)
      const data = await response.json()
      if (response.ok) {
        setAdmittedPatients(data.patients || [])
      } else {
        setMessage(`Error loading patients: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to load patients')
      console.error('Error:', error)
    } finally {
      setLoadingPatients(false)
    }
  }

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEvent.patientName || !newEvent.hospitalFacility || !newEvent.eventDate || !selectedDoctorId) {
      setMessage('❌ Please fill out all required fields')
      return
    }

    try {
      setCreating(true)
      
      // Use admissions endpoint for both admit and discharge
      const endpoint = '/api/admissions'
      const eventData = {
        patientAlias: newEvent.patientName,
        dobMonthYear: newEvent.dobMonthYear,
        diagnosis: newEvent.additionalNotes || 'New admission',
        hospitalName: newEvent.hospitalFacility,
        admissionDate: newEvent.eventDate,
        doctorId: selectedDoctorId,
        eventType: 'ADMIT', // Always ADMIT for new admissions
        notes: newEvent.additionalNotes
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })
      
      const data = await response.json()
      if (response.ok) {
        setMessage(`✅ Patient admitted and notification sent`)
        setNewEvent({
          patientName: '',
          dobMonthYear: '',
          eventType: 'ADMIT',
          hospitalFacility: '',
          eventDate: '',
          additionalNotes: ''
        })
        setShowNewAdmissionForm(false)
        // Reload the patient list
        loadPatientsForDoctor(selectedDoctorId)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to create admission`)
      console.error('Error:', error)
    } finally {
      setCreating(false)
    }
  }

  const dischargePatient = async (patientAlias: string) => {
    try {
      const dischargeDate = new Date().toISOString()
      const response = await fetch(`/api/patients/${patientAlias}/discharge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dischargeDate })
      })
      
      const data = await response.json()
      if (response.ok) {
        setMessage(`✅ Patient ${patientAlias} discharged at ${new Date().toLocaleString()}`)
        // Reload the patient list
        loadPatientsForDoctor(selectedDoctorId)
      } else {
        setMessage(`❌ Error discharging patient: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to discharge patient')
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <a href="/" className="text-xl sm:text-2xl font-bold text-[var(--primary-color,#0369a1)] hover:opacity-80 transition-opacity">TOCdoctor.com</a>
            <span className="hidden sm:inline text-sm text-gray-500">• Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs sm:text-sm text-gray-500">
              {user?.emailAddresses[0]?.emailAddress}
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      {/* Main content with responsive container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 flex items-center">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">Create new admission or discharge events</p>
          </div>
        </div>

        {message && (
          <Alert className="mt-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Doctor Selection */}
        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Patient Management
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Select a doctor to view and manage their patients</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="doctor" className="text-sm font-medium">Select Doctor *</Label>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Choose a doctor to manage patients" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.firstName && doctor.lastName 
                          ? `${doctor.firstName} ${doctor.lastName}`
                          : doctor.email
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient List for Selected Doctor */}
        {selectedDoctorId && (
          <Card className="mt-6 sm:mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                <div className="flex items-center">
                  <Hospital className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  Current Admissions
                </div>
                <Button 
                  onClick={() => setShowNewAdmissionForm(!showNewAdmissionForm)}
                  size="sm"
                  className="min-h-[36px]"
                  variant={showNewAdmissionForm ? "outline" : "default"}
                >
                  {showNewAdmissionForm ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      New Event
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Patients currently admitted under {(() => {
                  const doctor = doctors.find(d => d.id === selectedDoctorId);
                  return doctor?.firstName && doctor?.lastName 
                    ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                    : doctor?.email;
                })()}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {loadingPatients ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading patients...</p>
                </div>
              ) : admittedPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Hospital className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No patients currently admitted</p>
                  <p className="text-xs text-gray-400 mt-2">Click "New Event" to create an admission or discharge event</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {admittedPatients.map((patient) => (
                    <div key={patient.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors bg-white">
                      {/* Standardized Provider View */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                        {/* Name */}
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</div>
                          <div className="font-semibold text-lg mt-1">{patient.patientAlias}</div>
                        </div>
                        
                        {/* DOB */}
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">DOB</div>
                          <div className="font-medium mt-1">{patient.dobMonthYear || 'N/A'}</div>
                        </div>
                        
                        {/* Status */}
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</div>
                          <div className="font-medium mt-1 text-green-600">ADMITTED</div>
                        </div>
                        
                        {/* Hospital */}
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hospital</div>
                          <div className="font-medium mt-1 text-sm">{patient.hospitalName}</div>
                        </div>
                        
                        {/* Date */}
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</div>
                          <div className="font-medium mt-1 text-sm">{new Date(patient.admissionDate).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {/* Additional Notes/Diagnosis */}
                      <div className="border rounded p-3 bg-gray-50 mb-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</div>
                        <div className="text-sm mt-1">{patient.diagnosis}</div>
                      </div>

                      {/* Actions and Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {patient.reviewed && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Reviewed
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to discharge ${patient.patientAlias}?`)) {
                                dischargePatient(patient.patientAlias)
                              }
                            }}
                            className="min-h-[36px]"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Discharge
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* New Admission Form - Now appears right after the admissions card */}
        {showNewAdmissionForm && selectedDoctorId && (
          <Card className="mt-4 sm:mt-6 border-blue-200 bg-blue-50/30 transition-all duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                New Admission
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Create new patient admission for {(() => {
                  const doctor = doctors.find(d => d.id === selectedDoctorId);
                  return doctor?.firstName && doctor?.lastName 
                    ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                    : doctor?.email;
                })()}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={createEvent} className="space-y-6">
                {/* Standardized 5-Element Boxes for Providers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* 1. Name/ID */}
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Label htmlFor="patientName" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Name/ID *</Label>
                    <Input 
                      id="patientName" 
                      value={newEvent.patientName} 
                      onChange={(e) => setNewEvent({ ...newEvent, patientName: e.target.value })} 
                      placeholder="Patient ID" 
                      required 
                      className="mt-2 min-h-[44px] font-medium"
                    />
                  </div>

                  {/* 2. DOB MM/YYYY */}
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Label htmlFor="dobMonthYear" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">DOB</Label>
                    <Input 
                      id="dobMonthYear" 
                      placeholder="MM/YYYY" 
                      value={newEvent.dobMonthYear} 
                      onChange={(e) => setNewEvent({ ...newEvent, dobMonthYear: e.target.value })} 
                      maxLength={7}
                      className="mt-2 min-h-[44px] font-medium"
                    />
                  </div>

                  {/* 3. ADMIT (admission only) */}
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Status</Label>
                    <div className="mt-2 min-h-[44px] flex items-center bg-green-50 border border-green-200 rounded-md px-3 font-medium text-green-800">
                      ADMIT
                    </div>
                  </div>

                  {/* 4. Facility */}
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Label htmlFor="hospitalFacility" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Facility *</Label>
                    <Select value={newEvent.hospitalFacility} onValueChange={(value) => setNewEvent({ ...newEvent, hospitalFacility: value })}>
                      <SelectTrigger className="mt-2 min-h-[44px] font-medium">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitalAcronyms.map((hospital) => (
                          <SelectItem key={hospital.value} value={hospital.value}>
                            {hospital.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 5. Date */}
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Label htmlFor="eventDate" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Date *</Label>
                    <Input 
                      id="eventDate" 
                      type="datetime-local" 
                      value={newEvent.eventDate} 
                      onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })} 
                      required 
                      className="mt-2 min-h-[44px] font-medium"
                    />
                  </div>
                </div>

                {/* Diagnosis - Free Text Box */}
                <div className="border rounded-lg p-4 bg-white shadow-sm">
                  <Label htmlFor="additionalNotes" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Diagnosis & Notes</Label>
                  <textarea 
                    id="additionalNotes" 
                    value={newEvent.additionalNotes} 
                    onChange={(e) => setNewEvent({ ...newEvent, additionalNotes: e.target.value })}
                    placeholder="Enter diagnosis, additional information, or special instructions..."
                    rows={3}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewAdmissionForm(false)}
                    className="min-h-[48px] text-base flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="min-h-[48px] text-base flex-1" 
                    disabled={creating}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {creating ? 'Creating...' : 'Admit Patient'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
