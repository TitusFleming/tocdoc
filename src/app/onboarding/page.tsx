"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Shield, Stethoscope, ArrowRight, ArrowLeft, CheckCircle, User, Building, Settings, Lock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface OnboardingData {
  role: 'ADMIN' | 'PHYSICIAN' | null
  phone: string
  practice: string
  specialty: string
  npiNumber: string
  licenseNumber: string
  department: string
  title: string
  hospitalAffiliations: string[]
  facilityTaxId: string
  officeAddress: string
  contactHours: string
  emergencyContact: string
  timezone: string
  language: string
  hipaaTraining: boolean
  hipaaTrainingDate: string
  hipaaTrainingProvider: string
  securityClearance: string
}

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

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    role: null,
    phone: '',
    practice: '',
    specialty: '',
    npiNumber: '',
    licenseNumber: '',
    department: '',
    title: '',
    hospitalAffiliations: [],
    facilityTaxId: '',
    officeAddress: '',
    contactHours: '',
    emergencyContact: '',
    timezone: 'America/New_York',
    language: 'English',
    hipaaTraining: false,
    hipaaTrainingDate: '',
    hipaaTrainingProvider: '',
    securityClearance: ''
  })

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!user || !data.role) return

    setLoading(true)
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          ...data,
          onboardingComplete: true
        })
      })

      if (response.ok) {
        toast({
          title: "Onboarding Complete!",
          description: "Welcome to TOCdoc. Redirecting to your dashboard...",
        })
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        throw new Error('Failed to complete onboarding')
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return !!data.role
      case 2: return data.phone && data.practice
      case 3: 
        if (data.role === 'PHYSICIAN') {
          return data.specialty && data.npiNumber && data.licenseNumber
        } else {
          return data.department && data.title
        }
      case 4: return data.timezone && data.language
      case 5: return data.hipaaTraining
      default: return false
    }
  }

  // Step 1: Role Selection
  const renderRoleSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to TOCdoc</h2>
        <p className="text-muted-foreground">Let's set up your account. What's your role?</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card 
          className={`cursor-pointer transition-all ${data.role === 'PHYSICIAN' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
          onClick={() => updateData('role', 'PHYSICIAN')}
        >
          <CardContent className="p-6 text-center">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Physician</h3>
            <p className="text-sm text-muted-foreground">
              Receive discharge notifications and manage patient care coordination
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${data.role === 'ADMIN' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-md'}`}
          onClick={() => updateData('role', 'ADMIN')}
        >
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-semibold mb-2">Administrator</h3>
            <p className="text-sm text-muted-foreground">
              Manage system users, patient data, and HIPAA compliance
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Step 2: Basic Contact Information
  const renderContactInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <User className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
        <p className="text-muted-foreground">How can we reach you?</p>
      </div>
      
      <div className="grid gap-4">
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={data.phone}
            onChange={(e) => updateData('phone', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="practice">
            {data.role === 'PHYSICIAN' ? 'Practice/Organization Name *' : 'Organization/Hospital Name *'}
          </Label>
          <Input
            id="practice"
            placeholder={data.role === 'PHYSICIAN' ? 'Johnson Family Medicine' : 'Memorial Hospital System'}
            value={data.practice}
            onChange={(e) => updateData('practice', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="officeAddress">Office/Facility Address</Label>
          <Textarea
            id="officeAddress"
            placeholder="123 Medical Center Dr, Suite 100, City, State 12345"
            value={data.officeAddress}
            onChange={(e) => updateData('officeAddress', e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  )

  // Step 3: Professional Information
  const renderProfessionalInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Building className="h-12 w-12 mx-auto mb-4 text-green-600" />
        <h2 className="text-2xl font-bold mb-2">Professional Information</h2>
        <p className="text-muted-foreground">
          {data.role === 'PHYSICIAN' ? 'Your medical credentials' : 'Your administrative details'}
        </p>
      </div>
      
      {data.role === 'PHYSICIAN' ? (
        <div className="grid gap-4">
          <div>
            <Label htmlFor="specialty">Medical Specialty *</Label>
            <Select value={data.specialty} onValueChange={(value) => updateData('specialty', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="npiNumber">NPI Number *</Label>
            <Input
              id="npiNumber"
              placeholder="1234567890"
              value={data.npiNumber}
              onChange={(e) => updateData('npiNumber', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="licenseNumber">State Medical License Number *</Label>
            <Input
              id="licenseNumber"
              placeholder="MD12345"
              value={data.licenseNumber}
              onChange={(e) => updateData('licenseNumber', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="hospitalAffiliations">Hospital Affiliations</Label>
            <Textarea
              id="hospitalAffiliations"
              placeholder="Memorial Hospital, City General Hospital (one per line)"
              value={data.hospitalAffiliations.join('\n')}
              onChange={(e) => updateData('hospitalAffiliations', e.target.value.split('\n').filter(h => h.trim()))}
              rows={3}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div>
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="IT Administrator, Quality Director, etc."
              value={data.title}
              onChange={(e) => updateData('title', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              placeholder="Information Technology, Quality Assurance, etc."
              value={data.department}
              onChange={(e) => updateData('department', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="facilityTaxId">Facility Tax ID or NPI</Label>
            <Input
              id="facilityTaxId"
              placeholder="12-3456789"
              value={data.facilityTaxId}
              onChange={(e) => updateData('facilityTaxId', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="securityClearance">Security Clearance Level</Label>
            <Select value={data.securityClearance} onValueChange={(value) => updateData('securityClearance', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select clearance level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Access</SelectItem>
                <SelectItem value="elevated">Elevated Access</SelectItem>
                <SelectItem value="administrator">Full Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )

  // Step 4: Preferences
  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="h-12 w-12 mx-auto mb-4 text-orange-600" />
        <h2 className="text-2xl font-bold mb-2">System Preferences</h2>
        <p className="text-muted-foreground">Configure your notification and contact preferences</p>
      </div>
      
      <div className="grid gap-4">
        <div>
          <Label htmlFor="timezone">Time Zone *</Label>
          <Select value={data.timezone} onValueChange={(value) => updateData('timezone', value)}>
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
          <Label htmlFor="language">Preferred Language *</Label>
          <Select value={data.language} onValueChange={(value) => updateData('language', value)}>
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

        <div>
          <Label htmlFor="contactHours">Preferred Contact Hours</Label>
          <Input
            id="contactHours"
            placeholder="9 AM - 5 PM EST, Mon-Fri"
            value={data.contactHours}
            onChange={(e) => updateData('contactHours', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="emergencyContact">Emergency Contact Method</Label>
          <Input
            id="emergencyContact"
            placeholder="Call mobile: (555) 123-4567"
            value={data.emergencyContact}
            onChange={(e) => updateData('emergencyContact', e.target.value)}
          />
        </div>
      </div>
    </div>
  )

  // Step 5: Compliance & Security
  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Lock className="h-12 w-12 mx-auto mb-4 text-red-600" />
        <h2 className="text-2xl font-bold mb-2">HIPAA Compliance & Security</h2>
        <p className="text-muted-foreground">Final step - compliance verification</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hipaaTraining"
            checked={data.hipaaTraining}
            onCheckedChange={(checked: boolean) => updateData('hipaaTraining', checked)}
          />
          <Label htmlFor="hipaaTraining" className="text-sm">
            I have completed HIPAA training and understand my obligations regarding protected health information *
          </Label>
        </div>

        {data.hipaaTraining && (
          <div className="grid gap-4 pl-6">
            <div>
              <Label htmlFor="hipaaTrainingDate">HIPAA Training Completion Date</Label>
              <Input
                id="hipaaTrainingDate"
                type="date"
                value={data.hipaaTrainingDate}
                onChange={(e) => updateData('hipaaTrainingDate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="hipaaTrainingProvider">Training Provider</Label>
              <Input
                id="hipaaTrainingProvider"
                placeholder="e.g., Hospital HR Department, Online Course"
                value={data.hipaaTrainingProvider}
                onChange={(e) => updateData('hipaaTrainingProvider', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">System Security Requirements</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Two-factor authentication is required for all accounts</li>
            <li>• Sessions will automatically timeout after 15 minutes of inactivity</li>
            <li>• All patient data is encrypted and audit logged</li>
            <li>• No PHI will be included in email notifications</li>
            <li>• Records are automatically purged after 30 days post-discharge</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`flex items-center ${step === currentStep ? 'text-blue-600' : step < currentStep ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep ? 'bg-blue-600 text-white' : 
              step < currentStep ? 'bg-green-600 text-white' : 
              'bg-gray-200'
            }`}>
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < 5 && <div className={`w-12 h-0.5 ml-2 ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Role</span>
        <span>Contact</span>
        <span>Professional</span>
        <span>Preferences</span>
        <span>Compliance</span>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderRoleSelection()
      case 2: return renderContactInfo()
      case 3: return renderProfessionalInfo()
      case 4: return renderPreferences()
      case 5: return renderCompliance()
      default: return renderRoleSelection()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardContent className="p-8">
            {renderProgressBar()}
            {renderCurrentStep()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < 5 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="flex items-center"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || loading}
                  className="flex items-center bg-green-600 hover:bg-green-700"
                >
                  {loading ? "Completing..." : "Complete Onboarding"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 