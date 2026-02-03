import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "15-year Roadmap | Trail Net Zero",
  description:
    "Trail Net Zero’s living 15-year roadmap toward a net-zero trail running ecosystem, with phases for standards, implementation, and systems integration.",
};

const phases = [
  {
    title: "Phase 1: Community and Standards",
    years: "Years 1–3",
    bullets: [
      "Build a practitioner network",
      "Establish evidence standards",
      "Launch pilot projects",
    ],
  },
  {
    title: "Phase 2: Implementation and Scaling",
    years: "Years 4–9",
    bullets: [
      "Expand pilots across regions",
      "Support material and operational transitions",
      "Publish annual field reports",
    ],
  },
  {
    title: "Phase 3: Systems Integration",
    years: "Years 10–15",
    bullets: [
      "Embed sustainability into standard practice",
      "Support policy alignment and infrastructure change",
      "Measure and report ecosystem-level impact",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <section
          className="py-16 md:py-24"
          style={{ backgroundColor: "var(--section-light-blue)" }}
        >
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Roadmap
            </p>
            <h1 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-5xl">
              A 15-year roadmap toward net-zero trail running infrastructure
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-foreground/75">
              Trail Net Zero is guided by a long-term roadmap focused on
              building credible standards, scaling practical implementation, and
              supporting systems change. This roadmap is a living framework,
              updated as evidence and conditions evolve.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/join">Start a 14-day free trial</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/standards">Read Standards &amp; Evidence</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Phases
            </h2>
            <div className="mt-8 grid gap-6">
              {phases.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      {p.title}
                    </h3>
                    <p className="text-sm font-medium text-primary">{p.years}</p>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {p.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-sm text-foreground/70"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-14 rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="text-lg font-semibold text-foreground">
                What “living framework” means
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                As pilots produce results and constraints become clearer, the
                community updates methods, templates, and priorities. The goal
                is not static perfection—it’s durable infrastructure for better
                decisions over time.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground/70">
                If you’re new here, start with{" "}
                <Link
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  href="/forum"
                >
                  the forum preview
                </Link>{" "}
                and{" "}
                <Link
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  href="/standards"
                >
                  Standards &amp; Evidence
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

