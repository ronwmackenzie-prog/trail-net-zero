import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react";

const benefits = [
  "Access to member discussions and working groups",
  "Direct connection with industry practitioners",
  "Exclusive case studies and pilot documentation",
  "Verified contributor recognition",
  "Working group participation",
  "Community governance participation",
];

export function JoinSection() {
  return (
    <section
      id="join"
      className="py-20 md:py-28"
      style={{ backgroundColor: "var(--section-light-blue)" }}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Join the Community
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
              Ready to Make a Real Impact?
            </h2>
            <p className="mt-4 leading-relaxed text-foreground/75">
              Trail Net Zero is designed as infrastructure—not content. This
              community exists to support practitioners doing the work, learning
              together, and making better decisions over time.
            </p>
            <p className="mt-4 leading-relaxed text-foreground/75">
              Membership provides access to a professional network of peers who
              share your commitment to verifiable, evidence-based sustainability
              in trail running.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-white p-6 sm:p-8 shadow-xl">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground/60">
                Start with a free trial
              </p>
              <div className="mt-4 flex flex-col items-center justify-center gap-1">
                <span className="text-4xl font-bold text-foreground">
                  14 days free
                </span>
                <span className="text-sm text-foreground/70">
                  No credit card required
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground/60">
                $15/month after the trial to continue.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-3">
              <Button size="lg" className="w-full" asChild>
                <Link href="/join">
                  Start 14-day free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-center text-xs text-foreground/60">
                Get full access now. Upgrade after your trial if you want to
                continue.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 grid gap-6 border-t border-border pt-16 md:grid-cols-3">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">
              Clear Community Values
            </h3>
            <p className="mt-2 text-sm text-foreground/70">
              Our code of conduct ensures respectful, productive discourse.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">
              Verified Contributors
            </h3>
            <p className="mt-2 text-sm text-foreground/70">
              Recognition system for members with demonstrated expertise.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">
              Transparent Moderation
            </h3>
            <p className="mt-2 text-sm text-foreground/70">
              Published escalation processes and evidence expectations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
