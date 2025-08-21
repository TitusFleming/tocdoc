"use client"

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  
  // Form states
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  // const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // UI states
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Don't render anything until Clerk loads
  if (!isLoaded) {
    return null
  }

  // COMMENTED OUT: Phone number functionality
  // // Handle phone number formatting with auto-formatting as user types
  // const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // Extract only digits from the input (removing formatting)
  //   const value = e.target.value.replace(/\D/g, '')
  //   if (value.length <= 10) {
  //     setPhoneNumber(value)
  //   }
  // }

  // // Format phone display as (XXX) XXX-XXXX for user display
  // const formatPhoneDisplay = (phone: string) => {
  //   if (phone.length === 0) return ''
  //   if (phone.length <= 3) return `(${phone}`
  //   if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`
  //   return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`
  // }

  // // Format phone for Clerk (E.164 format) - match Clerk's expectations
  // const formatPhoneForClerk = (phone: string) => {
  //   // Remove any non-digits
  //   const digits = phone.replace(/\D/g, '')
  //   
  //   // Only format if we have exactly 10 digits (US number)
  //   if (digits.length === 10) {
  //     // Format as (XXX) XXX-XXXX for Clerk's display, then convert to +1XXXXXXXXXX for API
  //     return `+1${digits}`
  //   }
  //   
  //   // Don't format if not 10 digits
  //   return ''
  // }

  // Handle the submission of the sign-up form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded || !signUp) return
    
    setErrorMessage('')

    try {
      // Start the sign-up process using the email and password provided
      await signUp.create({
        emailAddress,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        ...(address && { unsafeMetadata: { address } })
      })

      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })

      // Set 'pendingVerification' true to display second form and capture the OTP code
      setPendingVerification(true)
    } catch (error: any) {
      console.error('Sign-up error:', JSON.stringify(error, null, 2))
      
      // Handle specific Clerk errors
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0]
        
        switch (firstError.code) {
          case 'form_identifier_exists':
            setErrorMessage('An account with this email already exists. Please try signing in.')
            break
          case 'form_password_pwned':
            setErrorMessage('This password has been found in a data breach. Please choose a more secure password.')
            break
          case 'form_password_length_too_short':
            setErrorMessage('Password must be at least 8 characters long.')
            break
          case 'form_password_not_strong_enough':
            setErrorMessage('Password not strong enough. Please use a mix of uppercase, lowercase, numbers, and special characters.')
            break
          case 'form_param_format_invalid':
            if (firstError.meta?.paramName === 'email_address') {
              setErrorMessage('Please enter a valid email address.')
            } 
            // COMMENTED OUT: Phone number validation
            // else if (firstError.meta?.paramName === 'phone_number') {
            //   setErrorMessage('Please enter a valid 10-digit US phone number.')
            // } 
            else {
              setErrorMessage(`Invalid ${firstError.meta?.paramName || 'field'} format.`)
            }
            break
          default:
            setErrorMessage(firstError.longMessage || firstError.message || 'Registration failed. Please try again.')
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    }
  }

  // Handle the submission of the verification form
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded || !signUp) return
    
    setErrorMessage('')

    try {
      // Use the code the user provided to attempt verification
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active and redirect the user
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        router.push('/auth-redirect')
      } else {
        // If the status is not complete, check why. User may need to complete further steps.
        console.error('Sign-up not complete:', JSON.stringify(completeSignUp, null, 2))
        setErrorMessage('Verification incomplete. Please try again or contact support.')
      }
    } catch (error: any) {
      console.error('Verification error:', JSON.stringify(error, null, 2))
      
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0]
        
        switch (firstError.code) {
          case 'form_code_incorrect':
            setErrorMessage('Invalid verification code. Please check your email and try again.')
            break
          case 'verification_expired':
            setErrorMessage('Verification code has expired. Please request a new code.')
            break
          case 'verification_failed':
            setErrorMessage('Email verification failed. Please try again.')
            break
          case 'verification_already_verified':
            setErrorMessage('Account already verified. Please try signing in instead.')
            break
          case 'session_exists':
            // User might already be signed in, redirect them
            router.push('/auth-redirect')
            break
          default:
            setErrorMessage(firstError.longMessage || firstError.message || 'Verification failed. Please try again.')
        }
      } else {
        setErrorMessage('An unexpected error occurred during verification.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">TOCdoctor.com</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Create Your Account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {!pendingVerification ? 'Create Account' : 'Verify Email'}
            </CardTitle>
            <CardDescription>
              {!pendingVerification 
                ? 'Enter your information to create your account'
                : 'Enter the verification code sent to your email'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!pendingVerification ? (
              // Registration Form
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
          type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
          type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="john@example.com"
          required
        />
                </div>

                {/* COMMENTED OUT: Phone number field
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formatPhoneDisplay(phoneNumber)}
                    onChange={handlePhoneChange}
                    placeholder="(333) 444-5555"
                    maxLength={14}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Enter 10 digits (no spaces, dashes, or parentheses)
                  </p>
                  {phoneNumber && (
                    <p className="text-xs text-blue-600 mt-1">
                      {phoneNumber.length}/10 digits • Will format as: +1{phoneNumber}
                    </p>
                  )}
                </div>
                */}

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
          type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Use 8+ chars with mix of letters, numbers & symbols"
          required
        />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Strong passwords contain uppercase, lowercase, numbers, and special characters
                  </p>
                </div>

                {/* CAPTCHA Widget */}
                <div id="clerk-captcha" data-cl-theme="auto" data-cl-size="normal"></div>

                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full min-h-[44px] text-base">
                  Create Account
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{' '}
                  <Link href="/sign-in" className="text-blue-600 hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </form>
            ) : (
              // Verification Form
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
          type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
          required
        />
                </div>

                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full min-h-[44px] text-base">
                  Verify Email
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Didn't receive the code? Check your spam folder or{' '}
                  <button 
                    type="button" 
                    onClick={() => setPendingVerification(false)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    try again
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 