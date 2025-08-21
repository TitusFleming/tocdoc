"use client"

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  
  // Form states
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // UI states
  const [errorMessage, setErrorMessage] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Don't render anything until Clerk loads
  if (!isLoaded) {
    return null
  }

  // Handle the submission of the sign-in form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded) return

    setIsSigningIn(true)
    setErrorMessage('')

    try {
      // Attempt to sign in
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/auth-redirect')
      } else {
        console.log('Sign-in incomplete:', result.status)
        setErrorMessage('Sign-in incomplete. Please try again.')
      }
    } catch (error: any) {
      console.error('Sign-in error:', error)
      
      // Handle specific Clerk errors
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0]
        
        switch (firstError.code) {
          case 'form_identifier_not_found':
            setErrorMessage('No account found with this email address. Please check your email or register first.')
            break
          case 'form_password_incorrect':
            setErrorMessage('Incorrect password. Please try again.')
            break
          case 'form_param_format_invalid':
            setErrorMessage('Please enter a valid email address.')
            break
          case 'too_many_requests':
            setErrorMessage('Too many sign-in attempts. Please wait before trying again.')
            break
          case 'session_exists':
            setErrorMessage('You are already signed in.')
            break
          default:
            setErrorMessage(firstError.longMessage || firstError.message || 'Invalid email or password. Please try again.')
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">TOCdoctor.com</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Welcome Back</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full min-h-[44px] text-base" disabled={isSigningIn}>
                {isSigningIn ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm">
                Don't have an account?{' '}
                <Link href="/sign-up" className="text-blue-600 hover:underline font-medium">
                  Register
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 