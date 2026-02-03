import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Standards & Evidence | Trail Net Zero",
  description:
    "How Trail Net Zero evaluates sustainability claims: evidence standards, documentation practices, and continuous improvement.",
};

export default function StandardsPage() {
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
              Standards &amp; Evidence
            </p>
            <h1 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-5xl">
              Evidence-first sustainability work
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-foreground/75">
              Trail Net Zero operates on an evidence-first model. We focus on
              practical, documented work that helps practitioners make credible
              decisions and avoid greenwashing—without pretending there’s a
              single perfect answer for every context.
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
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              What we prioritize
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "Peer-reviewed research",
                  body: "When available, we start with the strongest external evidence and translate it into usable practice.",
                },
                {
                  title: "Life-cycle assessment (LCA) data",
                  body: "We use LCA inputs to compare options, define boundaries, and understand trade-offs.",
                },
                {
                  title: "Field-tested pilot results",
                  body: "Real-world trials, measured outcomes, and what changed when conditions shifted.",
                },
                {
                  title: "Transparent documentation",
                  body: "Methods, assumptions, and data sources are as important as conclusions.",
                },
                {
                  title: "Continuous improvement",
                  body: "Standards evolve as new evidence emerges and as pilots reveal constraints and opportunities.",
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>

            <h2 className="mt-14 text-2xl font-bold text-foreground md:text-3xl">
              How members use this
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/70">
              <p>
                Members use shared templates to document pilots, assess claims,
                and distinguish between proposed ideas, tested practices, and
                validated outcomes.
              </p>
              <p>
                This approach supports credible decision-making and helps the
                community build shared knowledge over time—especially in areas
                where data is incomplete or context-specific.
              </p>
              <p>
                Next: see how these standards connect to a long-term strategy in{" "}
                <Link
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  href="/roadmap"
                >
                  the 15-year Roadmap
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

