import { MessageSquare } from "lucide-react"

export function ForumHero() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--section-light-blue)' }}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-6 text-balance text-3xl sm:text-4xl font-bold text-foreground md:text-5xl">
            Community Forum
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-foreground/75">
            Explore ongoing discussions, working group updates, and shared learnings from the 
            Trail Net Zero community.
          </p>
        </div>
      </div>
    </section>
  )
}
