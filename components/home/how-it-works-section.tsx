const steps = [
  {
    number: "01",
    title: "Apply to Join",
    description:
      "Submit your application with details about your role in the trail running ecosystem and your sustainability goals.",
  },
  {
    number: "02",
    title: "Get Verified",
    description:
      "Our team reviews applications to ensure all members are genuine practitioners committed to our community principles.",
  },
  {
    number: "03",
    title: "Get Access",
    description:
      "Get access to the Trail Net Zero member forum—our structured community space organized by topic.",
  },
  {
    number: "04",
    title: "Contribute & Learn",
    description:
      "Participate in discussions, share case studies, join working groups, and collaborate on real sustainability challenges.",
  },
];

const channels = [
  { category: "Start Here", items: ["Introductions", "Announcements", "Governance", "Help Desk"] },
  { category: "Core Topics", items: ["Apparel", "Footwear", "Sports Nutrition", "Race Operations"] },
  { category: "Working Groups", items: ["Pilots", "Materials", "Data", "Permits", "Cups", "Onboarding"] },
  { category: "Standards & Evidence", items: ["Claims", "Data", "Documentation"] },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How It Works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
            From Application to Impact
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Our onboarding process ensures every member understands the
            community{"'"}s purpose and can contribute meaningfully from day
            one.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="text-5xl font-bold text-primary/20">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Community Structure */}
        <div className="mt-20">
          <h3 className="text-center text-2xl font-bold text-foreground">
            Community Structure
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Intentionally structured to reduce noise and preserve institutional
            knowledge.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {channels.map((channel) => (
              <div
                key={channel.category}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h4 className="font-semibold text-foreground">
                  {channel.category}
                </h4>
                <ul className="mt-4 space-y-2">
                  {channel.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
