'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SuccessMessage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Remove `?success=true` from the URL after a short moment
      router.replace('/')
    }
  }, [countdown, router])

  const handleClose = () => {
    router.replace('/')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-primary/20 bg-card p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Welcome to the Community!
          </h2>
          
          <p className="mb-6 text-foreground/70">
            Your subscription is active. You’ll receive an email shortly with next steps.
          </p>

          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleClose}
            >
              Return to site
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-sm text-foreground/60">
              {countdown > 0 ? (
                <>Closing automatically in {countdown} second{countdown !== 1 ? 's' : ''}...</>
              ) : (
                'Closing...'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
