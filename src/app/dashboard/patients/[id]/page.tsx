"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Calendar, Phone, Clock, AlertCircle } from "lucide-react"

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

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchPatient()
  }, [patientId])

  const fetchPatient = async () => {
    try {
      setLoading(true)
      // First try to get all patients and find the specific one
      const response = await fetch('/api/patients')
      const data = await response.json()
      
      if (response.ok) {
        const foundPatient = data.patients.find((p: Patient) => p.id === patientId)
        if (foundPatient) {
          setPatient(foundPatient)
          setNotes(foundPatient.notes || "")
        }
      } else {
        console.error('Failed to fetch patient:', data.error)
      }
    } catch (error) {
      console.error('Error fetching patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getExpirationDate = () => {
    if (!patient?.discharge) return "30 days after discharge"
    const dischargeDate = new Date(patient.discharge)
    const expirationDate = new Date(dischargeDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    return expirationDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isRecentlyDischarged = () => {
    if (!patient?.discharge) return false
    const dischargeDate = new Date(patient.discharge)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return dischargeDate >= sevenDaysAgo
  }

  const handleSaveNotes = () => {
    // For pre-alpha, just show success message
    // In production, this would save to backend
    toast({
      title: "Notes saved",
      description: "Patient notes have been updated (demo mode)",
    })
  }

  const handleScheduleFollowup = () => {
    toast({
      title: "Follow-up scheduled", 
      description: "A follow-up appointment has been scheduled (demo mode)",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading patient details...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Patient Not Found</h1>
        <p className="text-muted-foreground">The patient you are looking for does not exist or you don't have permission to view it.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/patients">Back to Patients</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/patients">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{patient.name}</h1>
        <Badge
          variant={!patient.discharge ? "destructive" : "outline"}
          className={
            !patient.discharge
              ? "bg-red-100 text-red-800 hover:bg-red-100"
              : "bg-green-100 text-green-800 hover:bg-green-100"
          }
        >
          {!patient.discharge ? "Currently Admitted" : "Discharged"}
        </Badge>
        {isRecentlyDischarged() && (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <AlertCircle className="mr-1 h-3 w-3" />
            Follow-up Due
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Basic information about the patient</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="text-sm">{formatDate(patient.dob)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Patient ID</dt>
                <dd className="text-sm">{patient.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Facility</dt>
                <dd className="text-sm">{patient.facility}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Diagnosis</dt>
                <dd className="text-sm">{patient.diagnosis}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Admission Date</dt>
                <dd className="text-sm">{formatDateTime(patient.admission)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Discharge Date</dt>
                <dd className="text-sm">
                  {patient.discharge ? formatDateTime(patient.discharge) : "Still admitted"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Assigned Physician</dt>
                <dd className="text-sm">{patient.physician.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Record Created</dt>
                <dd className="text-sm">{formatDate(patient.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleScheduleFollowup}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Follow-up
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="mr-2 h-4 w-4" />
              Contact Patient
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HIPAA Compliance</CardTitle>
            <CardDescription>This record will be automatically deleted after 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-800" />
              </div>
              <div>
                <p className="text-sm font-medium">Record expires on:</p>
                <p className="text-xl font-bold">{getExpirationDate()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per HIPAA compliance requirements, this record will be automatically deleted 30 days after discharge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
          <TabsTrigger value="info">Additional Information</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Notes</CardTitle>
              <CardDescription>Transition of care notes and observations</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes about the patient's care, medications, follow-up requirements, etc..."
                className="min-h-[200px]"
              />
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a pre-alpha version. Notes are not actually saved to the database yet.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveNotes} className="bg-blue-600 hover:bg-blue-700">
                Save Notes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Medicare Advantage and follow-up coordination details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Medicare Advantage Status</h4>
                    <p className="text-sm text-muted-foreground">
                      {isRecentlyDischarged() 
                        ? "✅ Eligible for 3x reimbursement rate with timely follow-up"
                        : "Follow-up coordination opportunity"
                      }
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Care Coordination</h4>
                    <p className="text-sm text-muted-foreground">
                      {!patient.discharge 
                        ? "Patient currently admitted - discharge planning needed"
                        : "Transition of care coordination available"
                      }
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Available Features in Alpha</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Medication reconciliation tracking</li>
                    <li>• Follow-up study management</li>
                    <li>• Pending procedure coordination</li>
                    <li>• Automated discharge notifications</li>
                    <li>• Care transition documentation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
