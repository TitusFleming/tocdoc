'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, UserPlus, Calendar, Hospital, X, Mail, Image as ImageIcon, Users, Send } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Doctor {
  id: string
  email: string
  name?: string | null
}

interface UserInfo {
  id: string
  email: string
  name?: string | null
  role?: string
}

interface Patient {
  id: string
  patientAlias: string
  dobMonthYear?: string
  diagnosis: string
  hospitalName: string
  admissionDate: string
  admissionTime?: string
  reviewed: boolean
  createdAt: string
}

interface AdminDashboardProps {
  doctors: Doctor[]
  allUsers: UserInfo[]
}

export function AdminDashboard({ doctors, allUsers }: AdminDashboardProps) {
  const { user } = useUser()
  const [message, setMessage] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [admittedPatients, setAdmittedPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [showNewAdmissionForm, setShowNewAdmissionForm] = useState(false)
  const [showDischargeForm, setShowDischargeForm] = useState<string | null>(null)
  const [showCcPanel, setShowCcPanel] = useState(false)
  const [ccRecipients, setCcRecipients] = useState<UserInfo[]>([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [pastedImages, setPastedImages] = useState<{ file: File; preview: string }[]>([])
  const pasteAreaRef = useRef<HTMLTextAreaElement>(null)

  const [newEvent, setNewEvent] = useState({
    patientName: '',
    dobMonthYear: '',
    hospitalFacility: '',
    eventDate: '',
    eventTime: '',
    additionalNotes: '',
  })

  const [dischargeData, setDischargeData] = useState({
    date: '',
    time: '',
    notes: '',
  })

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
    { value: 'OTHER', label: 'Other (type in notes)' },
  ]

  useEffect(() => {
    if (selectedDoctorId) {
      loadPatientsForDoctor(selectedDoctorId)
      loadCcRecipients(selectedDoctorId)
    } else {
      setAdmittedPatients([])
      setCcRecipients([])
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
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Failed to load patients')
    } finally {
      setLoadingPatients(false)
    }
  }

  const loadCcRecipients = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/cc-recipients?doctorId=${doctorId}`)
      const data = await response.json()
      if (response.ok) {
        setCcRecipients(data.ccRecipients || [])
      }
    } catch {
      console.error('Failed to load CC recipients')
    }
  }

  const addCcRecipient = async (userId: string) => {
    try {
      const response = await fetch('/api/cc-recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: selectedDoctorId, userId }),
      })
      if (response.ok) {
        loadCcRecipients(selectedDoctorId)
        setMessage('CC recipient added')
      } else {
        const data = await response.json()
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Failed to add CC recipient')
    }
  }

  const removeCcRecipient = async (userId: string) => {
    try {
      await fetch('/api/cc-recipients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: selectedDoctorId, userId }),
      })
      loadCcRecipients(selectedDoctorId)
    } catch {
      setMessage('Failed to remove CC recipient')
    }
  }

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.patientName || !newEvent.hospitalFacility || !newEvent.eventDate || !selectedDoctorId) {
      setMessage('Please fill out all required fields')
      return
    }

    try {
      setCreating(true)
      const response = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientAlias: newEvent.patientName,
          dobMonthYear: newEvent.dobMonthYear,
          diagnosis: newEvent.additionalNotes || 'New admission',
          hospitalName: newEvent.hospitalFacility,
          admissionDate: newEvent.eventDate,
          admissionTime: newEvent.eventTime || null,
          doctorId: selectedDoctorId,
          eventType: 'ADMIT',
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setMessage('Patient admitted and notification sent')
        setNewEvent({ patientName: '', dobMonthYear: '', hospitalFacility: '', eventDate: '', eventTime: '', additionalNotes: '' })
        setShowNewAdmissionForm(false)
        loadPatientsForDoctor(selectedDoctorId)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Failed to create admission')
    } finally {
      setCreating(false)
    }
  }

  const dischargePatient = async (patient: Patient) => {
    if (!dischargeData.date) {
      setMessage('Please enter a discharge date')
      return
    }

    try {
      const response = await fetch(`/api/events/${patient.id}/discharge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dischargeDate: dischargeData.date,
          dischargeTime: dischargeData.time || null,
          dischargeNotes: dischargeData.notes || null,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        // Upload any pasted images
        if (pastedImages.length > 0) {
          for (const img of pastedImages) {
            const formData = new FormData()
            formData.append('file', img.file)
            formData.append('eventId', patient.id)
            await fetch('/api/upload', { method: 'POST', body: formData })
          }
        }
        setMessage(`Patient ${patient.patientAlias} discharged successfully`)
        setShowDischargeForm(null)
        setDischargeData({ date: '', time: '', notes: '' })
        setPastedImages([])
        loadPatientsForDoctor(selectedDoctorId)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Failed to discharge patient')
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault()
        const file = items[i].getAsFile()
        if (file) {
          const preview = URL.createObjectURL(file)
          setPastedImages(prev => [...prev, { file, preview }])
        }
        break
      }
    }
  }

  const removeImage = (index: number) => {
    setPastedImages(prev => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const sendInvite = async () => {
    if (!inviteEmail) return
    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddress: inviteEmail }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage(`Invitation sent to ${inviteEmail}`)
        setInviteEmail('')
        setShowInviteForm(false)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Failed to send invitation')
    }
  }

  const displayName = (u: { name?: string | null; email: string }) =>
    u.name || u.email

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <a href="/" className="text-xl sm:text-2xl font-bold text-[#0369a1] hover:opacity-80 transition-opacity">TOCdoctor.com</a>
            <span className="hidden sm:inline text-sm text-gray-500">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs sm:text-sm text-gray-500">
              {user?.emailAddresses[0]?.emailAddress}
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 flex items-center">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">Manage admissions, discharges, and notifications</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInviteForm(!showInviteForm)}
          >
            <Send className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>

        {message && (
          <Alert className="mt-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Invite User Form */}
        {showInviteForm && (
          <Card className="mt-4 border-green-200 bg-green-50/30">
            <CardContent className="p-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-sm">Email to invite</Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="mt-1"
                  />
                </div>
                <Button onClick={sendInvite} disabled={!inviteEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invite
                </Button>
                <Button variant="ghost" onClick={() => setShowInviteForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Doctor Selection */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Shield className="h-5 w-5 mr-2" />
              Patient Management
            </CardTitle>
            <CardDescription>Select a doctor to view and manage their patients</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Select Doctor *</Label>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {displayName(doctor)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CC Recipients Panel */}
        {selectedDoctorId && (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  CC Notification Recipients
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCcPanel(!showCcPanel)}
                >
                  {showCcPanel ? 'Hide' : 'Manage'}
                </Button>
              </CardTitle>
              <CardDescription className="text-xs">
                These users will also receive admission/discharge notifications for this doctor
              </CardDescription>
            </CardHeader>
            {showCcPanel && (
              <CardContent className="p-4 pt-0">
                {ccRecipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ccRecipients.map(cc => (
                      <span key={cc.id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {displayName(cc)}
                        <button onClick={() => removeCcRecipient(cc.id)} className="hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div>
                  <Label className="text-xs">Add user to CC list</Label>
                  <Select onValueChange={addCcRecipient}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a user to CC" />
                    </SelectTrigger>
                    <SelectContent>
                      {allUsers
                        .filter(u => u.id !== selectedDoctorId && !ccRecipients.find(cc => cc.id === u.id))
                        .map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {displayName(u)} ({u.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Patient List */}
        {selectedDoctorId && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center">
                  <Hospital className="h-5 w-5 mr-2" />
                  Current Admissions
                </div>
                <Button
                  onClick={() => setShowNewAdmissionForm(!showNewAdmissionForm)}
                  size="sm"
                  variant={showNewAdmissionForm ? "outline" : "default"}
                >
                  {showNewAdmissionForm ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><UserPlus className="h-4 w-4 mr-2" />New Admission</>}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {loadingPatients ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : admittedPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Hospital className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No patients currently admitted</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {admittedPatients.map((patient) => (
                    <div key={patient.id} className="border rounded-lg p-4 bg-white">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase">Name</div>
                          <div className="font-semibold text-lg mt-1">{patient.patientAlias}</div>
                        </div>
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase">DOB</div>
                          <div className="font-medium mt-1">{patient.dobMonthYear || 'N/A'}</div>
                        </div>
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase">Status</div>
                          <div className="font-medium mt-1 text-green-600">ADMITTED</div>
                        </div>
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase">Hospital</div>
                          <div className="font-medium mt-1 text-sm">{patient.hospitalName}</div>
                        </div>
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase">Date</div>
                          <div className="font-medium mt-1 text-sm">
                            {new Date(patient.admissionDate).toLocaleDateString()}
                            {patient.admissionTime && <span className="text-gray-500 ml-1">{patient.admissionTime}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="border rounded p-3 bg-gray-50 mb-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase">Diagnosis</div>
                        <div className="text-sm mt-1">{patient.diagnosis}</div>
                      </div>

                      <div className="flex justify-end gap-2">
                        {showDischargeForm === patient.id ? (
                          <Button variant="ghost" size="sm" onClick={() => { setShowDischargeForm(null); setPastedImages([]) }}>
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setShowDischargeForm(patient.id)
                              setDischargeData({ date: new Date().toISOString().split('T')[0], time: '', notes: '' })
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Discharge
                          </Button>
                        )}
                      </div>

                      {/* Discharge Form (inline) */}
                      {showDischargeForm === patient.id && (
                        <div className="mt-4 border-t pt-4 space-y-4">
                          <h4 className="font-semibold text-sm text-red-700">Discharge {patient.patientAlias}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs">Discharge Date *</Label>
                              <Input
                                type="date"
                                value={dischargeData.date}
                                onChange={e => setDischargeData(prev => ({ ...prev, date: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Discharge Time (optional)</Label>
                              <Input
                                type="time"
                                value={dischargeData.time}
                                onChange={e => setDischargeData(prev => ({ ...prev, time: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Discharge Notes (paste screenshots here)</Label>
                            <textarea
                              ref={pasteAreaRef}
                              value={dischargeData.notes}
                              onChange={e => setDischargeData(prev => ({ ...prev, notes: e.target.value }))}
                              onPaste={handlePaste}
                              placeholder="Enter discharge notes... You can paste screenshots (Cmd+V) directly here."
                              rows={4}
                              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                            />
                          </div>
                          {pastedImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {pastedImages.map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img src={img.preview} alt={`Pasted ${idx + 1}`} className="h-20 w-20 object-cover rounded border" />
                                  <button
                                    onClick={() => removeImage(idx)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <ImageIcon className="h-3 w-3" />
                            Supports pasted screenshots (JPG, PNG, GIF, WebP, max 4MB each)
                          </div>
                          <Button
                            onClick={() => dischargePatient(patient)}
                            variant="destructive"
                            className="w-full"
                          >
                            Confirm Discharge
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* New Admission Form */}
        {showNewAdmissionForm && selectedDoctorId && (
          <Card className="mt-4 border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <UserPlus className="h-5 w-5 mr-2" />
                New Admission
              </CardTitle>
              <CardDescription>
                Create new patient admission for {displayName(doctors.find(d => d.id === selectedDoctorId) || { email: '' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={createEvent} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Label className="text-xs font-semibold text-gray-700 uppercase">Patient Name/ID *</Label>
                    <Input
                      value={newEvent.patientName}
                      onChange={e => setNewEvent({ ...newEvent, patientName: e.target.value })}
                      placeholder="Patient identifier"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Label className="text-xs font-semibold text-gray-700 uppercase">DOB (optional)</Label>
                    <Input
                      placeholder="MM/YYYY"
                      value={newEvent.dobMonthYear}
                      onChange={e => setNewEvent({ ...newEvent, dobMonthYear: e.target.value })}
                      maxLength={7}
                      className="mt-2"
                    />
                  </div>
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Label className="text-xs font-semibold text-gray-700 uppercase">Hospital/Facility *</Label>
                    <Select value={newEvent.hospitalFacility} onValueChange={v => setNewEvent({ ...newEvent, hospitalFacility: v })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select facility" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitalAcronyms.map(h => (
                          <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Label className="text-xs font-semibold text-gray-700 uppercase">Admission Date *</Label>
                    <Input
                      type="date"
                      value={newEvent.eventDate}
                      onChange={e => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Label className="text-xs font-semibold text-gray-700 uppercase">Time (optional)</Label>
                    <Input
                      type="time"
                      value={newEvent.eventTime}
                      onChange={e => setNewEvent({ ...newEvent, eventTime: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-white shadow-sm">
                  <Label className="text-xs font-semibold text-gray-700 uppercase">Diagnosis & Notes</Label>
                  <textarea
                    value={newEvent.additionalNotes}
                    onChange={e => setNewEvent({ ...newEvent, additionalNotes: e.target.value })}
                    placeholder="Enter diagnosis, additional information..."
                    rows={3}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setShowNewAdmissionForm(false)} className="flex-1">
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={creating}>
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
