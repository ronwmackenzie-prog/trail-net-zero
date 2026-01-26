import { Mountain, Shirt, Apple, BarChart3, TreePine, Recycle, FileText, Users } from "lucide-react"

const categories = [
  {
    icon: Mountain,
    title: "Race Operations",
    description: "Aid stations, waste management, course marking, and event logistics.",
    topics: 42,
    posts: 186,
  },
  {
    icon: Shirt,
    title: "Apparel & Footwear",
    description: "Sustainable materials, circular design, and manufacturing practices.",
    topics: 38,
    posts: 157,
  },
  {
    icon: Apple,
    title: "Sports Nutrition",
    description: "Packaging alternatives, ingredient sourcing, and formulation.",
    topics: 29,
    posts: 112,
  },
  {
    icon: TreePine,
    title: "Land Stewardship",
    description: "Trail maintenance, conservation, and ecosystem restoration.",
    topics: 35,
    posts: 143,
  },
  {
    icon: BarChart3,
    title: "LCA & Data",
    description: "Life cycle assessments, carbon accounting, and measurement methodologies.",
    topics: 24,
    posts: 98,
  },
  {
    icon: Recycle,
    title: "Circular Economy",
    description: "Take-back programs, repair initiatives, and end-of-life solutions.",
    topics: 31,
    posts: 124,
  },
  {
    icon: FileText,
    title: "Standards & Claims",
    description: "Certifications, greenwashing analysis, and claim verification.",
    topics: 27,
    posts: 89,
  },
  {
    icon: Users,
    title: "Working Groups",
    description: "Collaborative projects, pilot programs, and initiative updates.",
    topics: 19,
    posts: 76,
  },
]

export function DiscussionCategories() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="text-2xl font-bold text-foreground">Discussion Categories</h2>
        <p className="mt-2 text-foreground/70">
          Browse topics by area of focus. Full access requires community membership.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.title}
              className="group flex items-start gap-4 rounded-xl border border-border bg-white p-5 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <category.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{category.title}</h3>
                <p className="mt-1 text-sm text-foreground/70">{category.description}</p>
                <div className="mt-3 flex gap-4 text-xs text-foreground/60">
                  <span>{category.topics} topics</span>
                  <span>{category.posts} posts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
