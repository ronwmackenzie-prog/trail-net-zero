'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { markWelcomeSeen } from '@/app/actions'

const WELCOME_DISMISSED_KEY = 'trail-net-zero-welcome-dismissed'

interface WelcomeModalProps {
  showWelcome: boolean
}

export function WelcomeModal({ showWelcome }: WelcomeModalProps) {
  const [open, setOpen] = useState(false)
  const [dismissing, setDismissing] = useState(false)

  // Check localStorage on mount to avoid showing modal if already dismissed locally
  useEffect(() => {
    const dismissed = localStorage.getItem(WELCOME_DISMISSED_KEY)
    if (showWelcome && !dismissed) {
      setOpen(true)
    }
  }, [showWelcome])

  const handleDismiss = async () => {
    setDismissing(true)
    
    // Set localStorage immediately to prevent showing again even if server fails
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true')
    
    try {
      const result = await markWelcomeSeen()
      if (result.error) {
        console.error('Failed to mark welcome as seen:', result.error)
      }
    } catch (error) {
      console.error('Failed to mark welcome as seen:', error)
    }
    
    setOpen(false)
    setDismissing(false)
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen && !dismissing) {
          handleDismiss()
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Welcome to Trail Net Zero
            <span role="img" aria-label="waving hand">👋</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Introduction to the Trail Net Zero community forum
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm text-foreground/90">
          <p>
            We&apos;re glad you&apos;re here. This community exists to help trail running
            evolve—thoughtfully, collaboratively, and without greenwashing—across
            nutrition, apparel, footwear, and race operations.
          </p>

          <div className="space-y-3">
            <p className="font-medium text-foreground">
              A few simple ways to get started (no rush):
            </p>

            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">Start with what interests you</p>
                  <p className="text-foreground/70">
                    You don&apos;t need to follow every category. Join one or two discussion
                    areas that match your role or curiosity. Each category has a short
                    description to help you orient quickly.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">Read more than you post (at first)</p>
                  <p className="text-foreground/70">
                    It&apos;s perfectly okay to listen before jumping in. Many members spend
                    their first week getting a feel for the tone, topics, and rhythms.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">Use threads for focused replies</p>
                  <p className="text-foreground/70">
                    When responding, use the reply feature on specific posts whenever possible.
                    This keeps conversations focused and makes the space easier for everyone to navigate.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">Categories are focused spaces</p>
                  <p className="text-foreground/70">
                    Each category is designed for a specific topic (data, materials, races,
                    claims, pilots, etc.). Staying on-topic helps keep discussions useful and
                    respectful of people&apos;s time.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">This is a learning community, not a marketing feed</p>
                  <p className="text-foreground/70">
                    Honest questions, partial answers, and real constraints are welcome.
                    Perfection is not expected.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-4">
            <p className="font-medium text-foreground">What to expect over the next few weeks:</p>
            <ul className="list-inside list-disc space-y-1 text-foreground/70">
              <li>Thoughtful prompts in discussion categories (no daily noise)</li>
              <li>Shared case studies and real-world examples</li>
              <li>Clear norms around claims, evidence, and collaboration</li>
              <li>Opportunities to contribute when it makes sense for you</li>
            </ul>
          </div>

          <p className="text-foreground/70">
            There is no finish line here. Participate at a pace that feels sustainable.
          </p>

          <p className="font-medium text-foreground">
            Thanks for being part of building the future of trail running—together.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={handleDismiss} disabled={dismissing}>
            {dismissing ? 'Getting started...' : "Let's get started"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
