import { Footprints, Shirt, Apple, BarChart3, TreePine } from "lucide-react"

const audiences = [
  {
    icon: Footprints,
    title: "Trail Race Directors",
    description: "Managing events with minimal environmental impact while maintaining participant experience.",
  },
  {
    icon: Shirt,
    title: "Apparel & Footwear Brands",
    description: "Manufacturers working on sustainable materials, circular design, and supply chain transparency.",
  },
  {
    icon: Apple,
    title: "Sports Nutrition Brands",
    description: "Companies exploring packaging alternatives, ingredient sourcing, and waste reduction.",
  },
  {
    icon: BarChart3,
    title: "Sustainability Practitioners",
    description: "LCA specialists, consultants, and professionals bringing technical expertise to the industry.",
  },
  {
    icon: TreePine,
    title: "Land Managers & Stewards",
    description: "Those responsible for trail systems, conservation areas, and environmental restoration.",
  },
]

export function AudienceSection() {
  return (
    <section id="who" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Who It{"'"}s For</p>
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
              Built for Industry Practitioners
            </h2>
            <p className="mt-4 leading-relaxed text-foreground/75">
              Trail Net Zero is intentionally not aimed at casual runners or the general public. 
              The tone is serious, credible, purpose-driven, and professional—not hype-driven.
            </p>
            <p className="mt-4 leading-relaxed text-foreground/75">
              Our members are professionals who care about real impact and are actively working 
              to make the trail running ecosystem more sustainable.
            </p>
          </div>

          <div className="space-y-4">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className="flex items-start gap-4 rounded-xl border border-border bg-white p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <audience.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{audience.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">{audience.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
