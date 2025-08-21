'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkReviewedButtonProps {
  eventId: string
  reviewed: boolean
}

export function MarkReviewedButton({ eventId, reviewed }: MarkReviewedButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: true })
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      router.refresh()
    } catch (error) {
      console.error('Error marking event as reviewed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (reviewed) {
    return (
      <div className="flex items-center justify-center gap-1 text-green-600">
        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-xs sm:text-sm font-medium">Reviewed</span>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isLoading}
      onClick={handleClick}
      className={cn(
        "text-blue-600 hover:text-blue-700 min-h-[36px] px-2 sm:px-3",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="hidden sm:inline text-xs">Marking...</span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Mark as reviewed</span>
          <span className="sm:hidden text-xs">Review</span>
        </div>
      )}
    </Button>
  )
}