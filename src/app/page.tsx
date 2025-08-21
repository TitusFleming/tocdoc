"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Menu, X, Heart } from "lucide-react"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { useState } from "react"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile-first responsive header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo - Always visible */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => setActiveTab('home')}>
            <Heart className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7" />
            <span className="text-xl font-bold sm:text-2xl text-[var(--primary-color,#0369a1)]">TOCdoctor.com</span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 mr-6">
              <button 
                onClick={() => setActiveTab('home')}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-600'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setActiveTab('about')}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${activeTab === 'about' ? 'text-blue-600' : 'text-gray-600'}`}
              >
                About
              </button>
              <button 
                onClick={() => setActiveTab('support')}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${activeTab === 'support' ? 'text-blue-600' : 'text-gray-600'}`}
              >
                Support
              </button>
            </nav>
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="outline" className="min-w-[80px]">Login</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="min-w-[90px]">Register</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/auth-redirect">
                <Button variant="outline" className="min-w-[100px]">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile Menu Button - Only visible on mobile */}
          <button
            className="md:hidden rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-screen opacity-100 border-t' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 py-4 space-y-3 bg-background/95">
            {/* Mobile Navigation Links */}
            <div className="space-y-2 border-b pb-3 mb-3">
              <button 
                onClick={() => {setActiveTab('home'); setIsMenuOpen(false)}}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'home' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                Home
              </button>
              <button 
                onClick={() => {setActiveTab('about'); setIsMenuOpen(false)}}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'about' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                About
              </button>
              <button 
                onClick={() => {setActiveTab('support'); setIsMenuOpen(false)}}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'support' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                Support
              </button>
            </div>
            
            <SignedOut>
              <Link 
                href="/sign-in" 
                onClick={() => setIsMenuOpen(false)}
                className="block w-full"
              >
                <Button variant="outline" className="w-full justify-start min-h-[44px]">
                  Login
                </Button>
              </Link>
              <Link 
                href="/sign-up" 
                onClick={() => setIsMenuOpen(false)}
                className="block w-full"
              >
                <Button className="w-full justify-start min-h-[44px]">
                  Register
                </Button>
            </Link>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/auth-redirect" 
                onClick={() => setIsMenuOpen(false)}
                className="block w-full"
              >
                <Button variant="outline" className="w-full justify-start min-h-[44px]">
                  Dashboard
                </Button>
            </Link>
              <div className="flex justify-center pt-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      </header>
      
      {/* Main content with responsive padding */}
      <main className="flex-1">
        {/* Home Tab Content */}
        {activeTab === 'home' && (
          <section className="relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] items-center justify-center py-12 sm:py-16 lg:py-20">
                <div className="text-center space-y-6 sm:space-y-8 max-w-4xl">
                  {/* Decorative line */}
                  <div className="text-2xl sm:text-3xl text-gray-400 font-light">⸻</div>
                  
                  {/* Main heading with improved typography */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-wide leading-tight">
                    <span className="block text-gray-900">Transition Of Care</span>
                    <span className="block text-[var(--primary-color,#0369a1)] font-semibold">Doctor.com</span>
                  </h1>
                  
                  {/* Description with client content */}
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-2 font-light">
                    TOCdoctor.com keeps hospitals, post-acute facilities, and primary care providers connected in real time. By streamlining communication at every transition of care, TOCdoctor.com closes gaps, reduces readmissions, and delivers smoother experiences for both patients and providers.
                  </p>

                  {/* Responsive action buttons */}
                  <div className="pt-8 sm:pt-10">
                    <SignedOut>
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-sm sm:max-w-none mx-auto">
                        <Link href="/sign-in" className="w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className="w-full sm:w-auto min-w-[160px] min-h-[52px] text-lg font-medium"
                          >
                            Login
                          </Button>
                        </Link>
                        <Link href="/sign-up" className="w-full sm:w-auto">
                          <Button 
                            size="lg" 
                            className="w-full sm:w-auto min-w-[160px] min-h-[52px] text-lg font-medium"
                          >
                            Register
                          </Button>
                        </Link>
                      </div>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/auth-redirect" className="inline-block">
                        <Button 
                          size="lg" 
                          className="min-w-[180px] min-h-[52px] text-lg font-medium"
                        >
                          Go to Dashboard
                        </Button>
                      </Link>
                    </SignedIn>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* About Tab Content */}
        {activeTab === 'about' && (
          <section className="relative">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="py-16 sm:py-20 lg:py-24">
                <div className="text-center space-y-8 sm:space-y-12">
                  {/* About heading */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-wide">
                    <span className="block text-[var(--primary-color,#0369a1)] font-semibold">Seamless Transitions.</span>
                    <span className="block text-gray-900 mt-2">Better Outcomes.</span>
            </h1>
                  
                  {/* About content */}
                  <div className="prose prose-lg sm:prose-xl max-w-none text-gray-600 leading-relaxed space-y-6">
                    <p className="text-lg sm:text-xl lg:text-2xl font-light">
                      TOCDOC is a secure, easy-to-use platform designed to streamline communication between hospitals, post-acute facilities, and primary care providers. By keeping physicians informed about their patients' admissions and discharges in real time, TOCDOC helps reduce gaps in care, prevent avoidable readmissions, and improve overall patient outcomes.
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-light">
                      With TOCDOC, care teams stay connected, patients receive smoother transitions, and providers gain the confidence that no critical information gets lost along the way.
                    </p>
                  </div>

                  {/* Call to action */}
                  <div className="pt-8">
                    <SignedOut>
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                        <Link href="/sign-up" className="w-full sm:w-auto">
                          <Button 
                            size="lg" 
                            className="w-full sm:w-auto min-w-[180px] min-h-[52px] text-lg font-medium"
                          >
                            Get Started Today
                          </Button>
                        </Link>
                        <Link href="/sign-in" className="w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className="w-full sm:w-auto min-w-[160px] min-h-[52px] text-lg font-medium"
                          >
                            Login
                          </Button>
              </Link>
                      </div>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/auth-redirect" className="inline-block">
                        <Button 
                          size="lg" 
                          className="min-w-[180px] min-h-[52px] text-lg font-medium"
                        >
                          Go to Dashboard
                        </Button>
              </Link>
                    </SignedIn>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Support Tab Content */}
        {activeTab === 'support' && (
          <section className="relative">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="py-16 sm:py-20 lg:py-24">
                <div className="text-center space-y-8 sm:space-y-12">
                  {/* Support heading */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-wide">
                    <span className="block text-[var(--primary-color,#0369a1)] font-semibold">Support &</span>
                    <span className="block text-gray-900 mt-2">Contact</span>
                  </h1>
                  
                  {/* Support content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mt-12">
                    <div className="text-center space-y-4">
                      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Technical Support</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Need help with TOCDOC? Our technical support team is here to assist you with any platform questions or issues.
                      </p>
                      <div className="pt-4">
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="min-w-[180px] min-h-[48px]"
                          onClick={() => window.open('mailto:support@tocdoc.com?subject=TOCDoc Support Request', '_blank')}
                        >
                          Email Support
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-center space-y-4">
                      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Sales & Information</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Interested in learning more about TOCDOC for your organization? Get in touch with our team.
                      </p>
                      <div className="pt-4">
                        <Button 
                          size="lg" 
                          className="min-w-[180px] min-h-[48px]"
                          onClick={() => window.open('mailto:sales@tocdoc.com?subject=TOCDoc Information Request', '_blank')}
                        >
                          Contact Sales
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-6 sm:p-8 mt-12">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Technical Support</h4>
                        <p>Email: support@tocdoc.com</p>
                        <p>Response time: Within 24 hours</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Sales & Information</h4>
                        <p>Email: sales@tocdoc.com</p>
                        <p>Response time: Within 4 hours</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        New to TOCDOC? Our onboarding team will help you get set up quickly and ensure your team is ready to improve care transitions from day one.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </section>
        )}
      </main>
      
      {/* Responsive footer */}
      <footer className="border-t bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
          © 2025 TOCDoc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
