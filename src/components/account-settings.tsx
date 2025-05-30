"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function AccountSettings() {
  const { user, isLoaded } = useUser()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [practice, setPractice] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [npiNumber, setNpiNumber] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [department, setDepartment] = useState("")
  const [title, setTitle] = useState("")
  const [hospitalAffiliations, setHospitalAffiliations] = useState<string[]>([])
  const [facilityTaxId, setFacilityTaxId] = useState("")
  const [officeAddress, setOfficeAddress] = useState("")
  const [contactHours, setContactHours] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [timezone, setTimezone] = useState("")
  const [language, setLanguage] = useState("")
  const [userRole, setUserRole] = useState("")
  const [hipaaTraining, setHipaaTraining] = useState(false)
  const [hipaaTrainingDate, setHipaaTrainingDate] = useState("")
  const [hipaaTrainingProvider, setHipaaTrainingProvider] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const specialties = [
    "Family Medicine", "Internal Medicine", "Cardiology", "Neurology", "Orthopedics",
    "Pediatrics", "Psychiatry", "Surgery", "Emergency Medicine", "Radiology",
    "Anesthesiology", "Pathology", "Dermatology", "Ophthalmology", "Other"
  ]

  const timezones = [
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Anchorage", "Pacific/Honolulu"
  ]

  const languages = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Other"]

  useEffect(() => {
    if (isLoaded && user) {
      // Set values from Clerk user data
      setName(user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '')
      setEmail(user.emailAddresses[0]?.emailAddress || '')
      setPhone(user.phoneNumbers[0]?.phoneNumber || '')
      
      // Fetch additional profile data from our database
      fetchUserProfile()
    }
  }, [isLoaded, user])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        
        // Basic info
        setUserRole(data.role || '')
        setPractice(data.practice || '')
        if (data.phone && !phone) setPhone(data.phone)
        
        // Professional info
        setSpecialty(data.specialty || '')
        setNpiNumber(data.npiNumber || '')
        setLicenseNumber(data.licenseNumber || '')
        setDepartment(data.department || '')
        setTitle(data.title || '')
        setHospitalAffiliations(data.hospitalAffiliations || [])
        setFacilityTaxId(data.facilityTaxId || '')
        setOfficeAddress(data.officeAddress || '')
        
        // Preferences
        setContactHours(data.contactHours || '')
        setEmergencyContact(data.emergencyContact || '')
        setTimezone(data.timezone || 'America/New_York')
        setLanguage(data.language || 'English')
        
        // Compliance
        setHipaaTraining(data.hipaaTraining || false)
        setHipaaTrainingDate(data.hipaaTrainingDate ? new Date(data.hipaaTrainingDate).toISOString().split('T')[0] : '')
        setHipaaTrainingProvider(data.hipaaTrainingProvider || '')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleSaveSettings = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Update Clerk user profile
      await user.update({
        firstName: name.split(' ')[0] || '',
        lastName: name.split(' ').slice(1).join(' ') || '',
      })

      // Update our database with all additional info
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          practice,
          specialty,
          npiNumber,
          licenseNumber,
          department,
          title,
          hospitalAffiliations,
          facilityTaxId,
          officeAddress,
          contactHours,
          emergencyContact,
          timezone,
          language,
          hipaaTraining,
          hipaaTrainingDate: hipaaTrainingDate || null,
          hipaaTrainingProvider,
        })
      })

      if (response.ok) {
    toast({
      title: "Settings saved",
          description: "Your account information has been updated successfully",
    })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to update account information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
    <Card>
      <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your contact information and account details.</CardDescription>
            </div>
            {userRole && (
              <Badge variant="outline" className="capitalize">
                {userRole.toLowerCase().replace('_', ' ')}
              </Badge>
            )}
          </div>
      </CardHeader>
      <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
          <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name" 
              />
        </div>
            <div>
          <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed here. Use your Clerk account settings to update your email.
              </p>
            </div>
        </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
          <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567" 
              />
            </div>
            <div>
              <Label htmlFor="practice">
                {userRole === 'PHYSICIAN' ? 'Practice/Organization' : 'Organization/Hospital'}
              </Label>
              <Input 
                id="practice" 
                value={practice} 
                onChange={(e) => setPractice(e.target.value)}
                placeholder={userRole === 'PHYSICIAN' ? 'Johnson Family Medicine' : 'Memorial Hospital System'} 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="officeAddress">Office/Facility Address</Label>
            <Textarea
              id="officeAddress"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              placeholder="123 Medical Center Dr, Suite 100, City, State 12345"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>
            {userRole === 'PHYSICIAN' ? 'Your medical credentials and specialties' : 'Your administrative role and responsibilities'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userRole === 'PHYSICIAN' ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="specialty">Medical Specialty</Label>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="npiNumber">NPI Number</Label>
                  <Input
                    id="npiNumber"
                    value={npiNumber}
                    onChange={(e) => setNpiNumber(e.target.value)}
                    placeholder="1234567890"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="licenseNumber">Medical License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="MD12345"
                  />
                </div>
                <div>
                  <Label htmlFor="facilityTaxId">Facility Tax ID (if applicable)</Label>
                  <Input
                    id="facilityTaxId"
                    value={facilityTaxId}
                    onChange={(e) => setFacilityTaxId(e.target.value)}
                    placeholder="12-3456789"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hospitalAffiliations">Hospital Affiliations</Label>
                <Textarea
                  id="hospitalAffiliations"
                  value={hospitalAffiliations.join('\n')}
                  onChange={(e) => setHospitalAffiliations(e.target.value.split('\n').filter(h => h.trim()))}
                  placeholder="Memorial Hospital&#10;City General Hospital&#10;(one per line)"
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="IT Administrator, Quality Director, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Information Technology, Quality Assurance, etc."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="facilityTaxId">Facility Tax ID or NPI</Label>
                <Input
                  id="facilityTaxId"
                  value={facilityTaxId}
                  onChange={(e) => setFacilityTaxId(e.target.value)}
                  placeholder="12-3456789"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Preferences</CardTitle>
          <CardDescription>How and when to contact you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="timezone">Time Zone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="contactHours">Preferred Contact Hours</Label>
              <Input
                id="contactHours"
                value={contactHours}
                onChange={(e) => setContactHours(e.target.value)}
                placeholder="9 AM - 5 PM EST, Mon-Fri"
              />
            </div>
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact Method</Label>
              <Input
                id="emergencyContact"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Call mobile: (555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HIPAA Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>HIPAA Compliance</CardTitle>
          <CardDescription>Training and compliance information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant={hipaaTraining ? "default" : "destructive"}>
              {hipaaTraining ? "Training Complete" : "Training Required"}
            </Badge>
          </div>

          {hipaaTraining && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="hipaaTrainingDate">Training Completion Date</Label>
                <Input
                  id="hipaaTrainingDate"
                  type="date"
                  value={hipaaTrainingDate}
                  onChange={(e) => setHipaaTrainingDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hipaaTrainingProvider">Training Provider</Label>
                <Input
                  id="hipaaTrainingProvider"
                  value={hipaaTrainingProvider}
                  onChange={(e) => setHipaaTrainingProvider(e.target.value)}
                  placeholder="Hospital HR Department, Online Course, etc."
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>System information and account status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Last Sign In:</strong> {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Role:</strong> {userRole}</p>
        </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSaveSettings} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
    </div>
  )
}
