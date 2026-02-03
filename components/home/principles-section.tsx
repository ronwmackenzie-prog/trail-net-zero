import { CheckCircle, Shield, MessageSquare, Target } from "lucide-react"

const principles = [
  {
    icon: CheckCircle,
    title: "Evidence Over Marketing",
    description: "We prioritize data, case studies, and verified outcomes over promotional language and unsubstantiated claims.",
  },
  {
    icon: Shield,
    title: "Anti-Greenwashing",
    description: "Our community holds a high standard for transparency and accountability. No vague promises—only measurable progress.",
  },
  {
    icon: MessageSquare,
    title: "Respectful Discourse",
    description: "Professional, constructive conversations that advance collective understanding and drive real-world solutions.",
  },
  {
    icon: Target,
    title: "Focus on Outcomes",
    description: "Pilots, case studies, and documented results. We celebrate learning from both successes and failures.",
  },
]

export function PrinciplesSection() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--section-light-blue)' }}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our Principles</p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
            A Community Built on Integrity
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-foreground/75">
            Trail Net Zero is not a marketing channel. It{"'"}s a working community for
            practitioners who want to move beyond claims and into real-world implementation.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="group rounded-xl border border-border bg-white p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <principle.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{principle.title}</h3>
              <p className="mt-2 leading-relaxed text-foreground/70">{principle.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
