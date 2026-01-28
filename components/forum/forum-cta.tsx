import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function ForumCta() {
  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: "var(--section-light-blue)" }}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="rounded-2xl bg-primary p-8 text-center md:p-12">
          <h2 className="text-balance text-2xl font-bold text-primary-foreground md:text-3xl">
            Ready to Join the Conversation?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/90">
            Start with a 2-week free trial (no credit card required), then
            continue for $15/month to keep full access to threads, working
            groups, and member resources.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/join">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/#how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
