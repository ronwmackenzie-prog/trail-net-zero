import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { createBillingPortalSession } from '@/app/actions'
import { Button } from '@/components/ui/button'

export default function AccountPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 md:px-6">
        <section>
          <h1 className="text-3xl font-bold text-foreground">Account & Billing</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Manage your Trail Net Zero membership and update your billing details.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Open the billing portal to update payment methods, view invoices, or cancel your
            subscription.
          </p>
          <form action={createBillingPortalSession} className="mt-4">
            <Button type="submit">Open billing portal</Button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  )
}

