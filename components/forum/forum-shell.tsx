'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '@/app/actions'

type MembershipStatus = 'loading' | 'trial' | 'subscribed' | 'expired' | 'none'

interface ForumShellProps {
  // Server action passed from the page
  checkoutAction?: typeof createCheckoutSession
}

export function ForumShell({ checkoutAction = createCheckoutSession }: ForumShellProps) {
  const [status, setStatus] = useState<MembershipStatus>('loading')
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setStatus('none')
          return
        }

        const [profileRes, subRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('trial_ends_at, is_admin')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('stripe_subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle(),
        ])

        const adminStatus = profileRes.data?.is_admin ?? false
        setIsAdmin(adminStatus)

        // Admins bypass all subscription checks
        if (adminStatus) {
          setStatus('subscribed')
          return
        }

        const hasActiveSub = !!subRes.data
        const trialEnd = profileRes.data?.trial_ends_at
          ? new Date(profileRes.data.trial_ends_at as string)
          : null

        const now = new Date()
        const trialActive = !!trialEnd && trialEnd > now
        const trialExpired = !!trialEnd && trialEnd <= now

        setTrialEndsAt(trialEnd)

        if (hasActiveSub) {
          setStatus('subscribed')
        } else if (trialActive) {
          setStatus('trial')
        } else if (trialExpired) {
          setStatus('expired')
        } else {
          setStatus('none')
        }
      } catch (err) {
        console.error('Error loading membership status', err)
        setStatus('none')
      }
    }

    void load()
  }, [])

  const daysLeft = useMemo(() => {
    if (!trialEndsAt) return null
    const now = new Date()
    const diffMs = trialEndsAt.getTime() - now.getTime()
    if (diffMs <= 0) return 0
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }, [trialEndsAt])

  const hasFullAccess = isAdmin || status === 'subscribed' || status === 'trial'
  const showUpgradeCta = !isAdmin && (status === 'trial' || status === 'expired' || status === 'none')

  const handleRestrictedClick = () => {
    if (hasFullAccess) {
      // In a real forum, this would navigate to topic/thread pages.
      return
    }
    setShowUpgradeModal(true)
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:gap-10 md:px-6">
      {/* Sidebar navigation */}
      <aside className="w-full shrink-0 rounded-2xl border border-border bg-card/60 p-5 shadow-sm md:w-64">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/70">
          Forum Navigation
        </h2>
        <nav className="mt-4 space-y-3 text-sm">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg bg-primary/5 px-3 py-2 text-left text-foreground hover:bg-primary/10"
          >
            <span>Overview</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-foreground/80 hover:bg-accent"
            onClick={handleRestrictedClick}
          >
            <span>Topics &amp; Threads</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-foreground/80 hover:bg-accent"
            onClick={handleRestrictedClick}
          >
            <span>My Activity</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-foreground/80 hover:bg-accent"
          >
            <span>Guidelines</span>
          </button>
        </nav>

        {showUpgradeCta && (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
            {status === 'trial' && daysLeft !== null && (
              <p className="mb-3 text-foreground">
                <span className="font-semibold">{daysLeft} days left</span> in your free trial.
              </p>
            )}
            {(status === 'expired' || status === 'none') && (
              <p className="mb-3 text-foreground">
                Upgrade to unlock full access to working groups, case studies, and member
                discussions.
              </p>
            )}
            <form action={checkoutAction}>
              <Button type="submit" size="sm" className="w-full">
                Upgrade to full membership
              </Button>
            </form>
          </div>
        )}
      </aside>

      {/* Main content */}
      <section className="flex-1 space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Member Forum</h1>
          <p className="max-w-2xl text-sm text-foreground/70">
            Structured discussions for trail running sustainability practitioners. Explore topics,
            learn from case studies, and collaborate on real-world pilots.
          </p>
          {isAdmin && (
            <p className="text-xs font-medium text-primary">
              Admin access — full forum control enabled.
            </p>
          )}
          {!isAdmin && status === 'trial' && daysLeft !== null && (
            <p className="text-xs font-medium text-primary">
              You&apos;re in a free trial. {daysLeft} day{daysLeft !== 1 ? 's' : ''} of full access
              remaining.
            </p>
          )}
          {!isAdmin && status === 'expired' && (
            <p className="text-xs font-medium text-destructive">
              Your free trial has ended. Upgrade to continue participating in discussions.
            </p>
          )}
        </header>

        {/* Topics overview - visible to everyone signed in */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Core Topics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: 'Race Operations',
                description:
                  'Permits, logistics, course design, and on-event impact for trail races.',
              },
              {
                title: 'Apparel & Footwear',
                description:
                  'Materials, durability, LCA, and circularity for product teams and brands.',
              },
              {
                title: 'Sports Nutrition',
                description:
                  'Packaging, sourcing, and waste minimization for gels, powders, and on-course food.',
              },
              {
                title: 'Data & Standards',
                description:
                  'Shared methodologies, data schemas, and evidence standards for claims.',
              },
            ].map((topic) => (
              <button
                key={topic.title}
                type="button"
                onClick={handleRestrictedClick}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-4 text-left shadow-xs transition hover:border-primary/40 hover:shadow-md"
              >
                <h3 className="text-sm font-semibold text-foreground">{topic.title}</h3>
                <p className="mt-2 text-xs text-foreground/70">{topic.description}</p>
                <span className="mt-4 text-xs font-medium text-primary">
                  {hasFullAccess ? 'View threads' : 'Preview topics'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent activity preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleRestrictedClick}
            >
              Start a new thread
            </Button>
          </div>
          <div className="space-y-3">
            {[
              {
                title: 'Pilot: Reusable cup systems for 500+ person events',
                meta: 'Race Operations · Case Study',
              },
              {
                title: 'Comparing material data sources for recycled polyamide',
                meta: 'Apparel & Footwear · Methods',
              },
              {
                title: 'Standardizing emissions boundaries for on-course nutrition',
                meta: 'Sports Nutrition · Standards',
              },
            ].map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={handleRestrictedClick}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition hover:border-primary/40 hover:bg-card/80"
              >
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-foreground/60">{item.meta}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Upgrade modal for restricted actions */}
      {showUpgradeModal && showUpgradeCta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-foreground">Upgrade to keep going</h2>
            <p className="mt-2 text-sm text-foreground/70">
              Your free trial has ended. Upgrade to a paid membership to read full threads, post,
              and participate in working groups.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <form action={checkoutAction} className="sm:w-auto">
                <Button type="submit" className="w-full sm:w-auto">
                  Upgrade to full membership
                </Button>
              </form>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setShowUpgradeModal(false)}
              >
                Not now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

