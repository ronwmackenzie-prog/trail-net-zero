import { Mail } from "lucide-react"

export function ContactHero() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--section-light-blue)' }}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-6 text-balance text-3xl sm:text-4xl font-bold text-foreground md:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-foreground/75">
            Have questions about membership, partnerships, or how the community works? 
            We{"'"}re here to help.
          </p>
        </div>
      </div>
    </section>
  )
}
