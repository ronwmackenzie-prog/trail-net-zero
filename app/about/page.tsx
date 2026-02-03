import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About | Trail Net Zero",
  description:
    "Why Trail Net Zero exists: a practitioner community coordinating evidence-based sustainability action across trail running.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main>
        <section
          className="border-b border-border py-16 md:py-24"
          style={{ backgroundColor: "var(--section-light-blue)" }}
        >
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              About
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Coordinating evidence-based action in trail running
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-foreground/75">
              Trail Net Zero was founded to address a growing gap in the trail
              running industry: the lack of shared, credible infrastructure for
              sustainability decision-making.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/join">Start a 14-day free trial</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/forum">Preview the forum</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <div className="space-y-5 text-sm leading-relaxed text-foreground/70">
              <p>
                As environmental pressures increase across public lands, supply
                chains, and event operations, isolated efforts are no longer
                sufficient. Trail Net Zero exists to coordinate action—grounded
                in evidence, transparency, and collaboration.
              </p>
              <p>
                We are not a marketing platform. We are a working community
                committed to measurable outcomes, long-term systems change, and
                integrity.
              </p>
              <p>
                Our long-term vision is a trail running ecosystem that operates
                within ecological limits while strengthening community, access,
                and stewardship for generations to come.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {[
                {
                  title: "Evidence-first standards",
                  body: "Clear expectations for claims, methods, and documentation—so decisions are grounded, not performative.",
                  href: "/standards",
                  cta: "Read Standards & Evidence",
                },
                {
                  title: "A 15-year roadmap",
                  body: "A long-term, phased approach for standards, scaling implementation, and systems integration.",
                  href: "/roadmap",
                  cta: "Explore the Roadmap",
                },
              ].map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                >
                  <h2 className="text-lg font-semibold text-foreground">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                    {card.body}
                  </p>
                  <p className="mt-4 text-sm font-medium text-primary">
                    {card.cta}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-b from-background to-primary/5">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6 md:py-24">
            <h2 className="text-3xl font-bold text-foreground">
              Ready to Join the Conversation?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/70">
              Start your free 14-day trial and become part of a practitioner
              community dedicated to building credible, long-term
              sustainability infrastructure for trail running.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/join">Start free trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/forum">Explore the forum</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
