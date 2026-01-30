import Image from "next/image";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About | Trail Net Zero",
  description:
    "Learn about Ronald Wayne MacKenzie and the mission behind Trail Bites, Threads, and Treads - a community dedicated to sustainable trail running.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
              {/* Image */}
              <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-border bg-muted shadow-lg md:order-2">
                {/* Placeholder for Ron's image */}
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
                      <span className="text-4xl font-bold text-primary">RM</span>
                    </div>
                    <p className="text-sm text-foreground/60">
                      Founder photo placeholder
                    </p>
                  </div>
                </div>
                {/* Uncomment and update when image is available:
                <Image
                  src="/ron-mackenzie.jpg"
                  alt="Ronald Wayne MacKenzie, Founder of Trail Bites, Threads, and Treads"
                  fill
                  className="object-cover"
                  priority
                />
                */}
              </div>

              {/* Content */}
              <div className="space-y-6 md:order-1">
                <div className="space-y-2">
                  <p className="text-sm font-medium uppercase tracking-wider text-primary">
                    Meet the Founder
                  </p>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                    Ronald Wayne MacKenzie
                  </h1>
                  <p className="text-lg text-foreground/70">
                    Founder &amp; President
                  </p>
                </div>
                <p className="text-lg leading-relaxed text-foreground/80">
                  Ultrarunner. Sports nutrition coach. Regenerative agriculture
                  advocate. Educator. Community organizer. For more than 30
                  years, trail running has shaped Ron&apos;s life and mission.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
            <div className="prose prose-lg mx-auto text-foreground/80">
              <h2 className="text-2xl font-bold text-foreground">
                Why This Community Exists
              </h2>

              <p>
                I founded this community because I believe trail running can be
                more than a sport—it can be a force for human health,
                environmental stewardship, and meaningful systems change.
              </p>

              <p>
                For more than 30 years, trail running has shaped my life. Along
                the way, I have worked as an ultrarunner, sports nutrition
                coach, regenerative agriculture advocate, educator, and
                community organizer.
              </p>

              <p>
                What I have seen—again and again—is that the choices we make
                around food, gear, race design, and land use are deeply
                connected. Yet too often, these conversations happen in silos.
              </p>

              <blockquote className="border-l-4 border-primary bg-primary/5 py-4 pl-6 pr-4 not-italic">
                <p className="text-foreground">
                  Trail Bites, Threads, and Treads exists to change that.
                </p>
              </blockquote>

              <p>
                This is a working community for people who care deeply about
                performance <em>and</em> responsibility—athletes, race
                directors, farmers, researchers, designers, brands, and
                public-sector partners who want to move beyond greenwashing and
                toward real, measurable impact.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground">
                How We Work Together
              </h2>
              <p className="mt-4 text-lg text-foreground/70">
                The principles that guide our community
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Ask Better Questions
                </h3>
                <p className="text-sm text-foreground/70">
                  We prioritize curiosity over certainty, seeking deeper
                  understanding through thoughtful inquiry.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Share What Works
                </h3>
                <p className="text-sm text-foreground/70">
                  We openly share what is working—and what is not—so everyone
                  can learn and improve.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Learn From Each Other
                </h3>
                <p className="text-sm text-foreground/70">
                  Every member brings unique expertise. Together, we create
                  knowledge none of us could alone.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-2xl">🛠️</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Build Solutions Together
                </h3>
                <p className="text-sm text-foreground/70">
                  We move from conversation to action, collaborating on
                  real-world projects and pilots.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Invitation Section */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
            <div className="prose prose-lg mx-auto text-foreground/80">
              <p>
                Whether you are here to listen, contribute expertise, challenge
                assumptions, or help shape what comes next, you belong. I
                encourage you to introduce yourself, explore the discussions,
                and engage in a way that feels authentic to you.
              </p>

              <p>
                Thank you for choosing to be part of this early community. The
                future of trail running is something we build—together.
              </p>

              <div className="mt-8 border-t border-border pt-8">
                <p className="mb-1 text-foreground/60">With gratitude,</p>
                <p className="text-lg font-semibold text-foreground">
                  Ronald Wayne MacKenzie
                </p>
                <p className="text-foreground/70">
                  Founder &amp; President
                  <br />
                  Trail Bites, Threads, and Treads
                </p>
              </div>
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
              Start your free 14-day trial and become part of a community
              dedicated to building the future of sustainable trail running.
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
