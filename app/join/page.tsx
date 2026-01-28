import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"

const benefits = [
  "Full access to member discussions and working groups",
  "Case studies, templates, and practitioner documentation",
  "Evidence-based standards for claims and methodology",
  "Direct peer network across race ops, brands, and consultants",
]

export const metadata = {
  title: "Start your free trial | Trail Net Zero",
  description:
    "Start a 2-week free trial (no credit card required). Continue for $15/month after your trial to keep access.",
}

export default function JoinTrialPage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          2-week free trial
        </p>
        <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
          Get full access for 14 days — no credit card required
        </h1>
        <p className="max-w-2xl text-sm text-foreground/70">
          Create an account to join the Trail Net Zero community. After your trial, you can
          continue for <span className="font-medium text-foreground">$15/month</span>.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">What you get</h2>
          <ul className="mt-4 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Start now</h2>
          <p className="mt-2 text-sm text-foreground/70">
            You’ll be able to read and participate immediately after signing in.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/auth/sign-up?redirect=/forum">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/sign-in?redirect=/forum">I already have an account</Link>
            </Button>
            <p className="text-xs text-foreground/60">
              No credit card required. Upgrade later to keep access after your trial.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

