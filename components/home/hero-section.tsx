import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mountain, Leaf, Users } from "lucide-react"

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--section-light-blue)" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 md:py-32 lg:py-40">
        <div className="grid items-center gap-8 lg:items-start lg:gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="lg:pt-2">
            <h1 className="text-balance text-3xl sm:text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Trail Net Zero: practical, evidence-based sustainability for{" "}
              <span className="text-primary">trail running</span>
            </h1>

            <p className="mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-foreground/75">
              Trail Net Zero is a professional sustainability community for
              trail running. We bring together race directors, brands, land
              stewards, and practitioners to reduce environmental impact across
              trail running—from materials and nutrition to event operations and
              infrastructure.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/join">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary/20 text-foreground hover:bg-primary/10 hover:text-foreground bg-transparent"
              >
                <Link href="#how-it-works">Learn How It Works</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 sm:gap-8">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  15-year
                </p>
                <p className="mt-1 text-xs sm:text-sm text-foreground/60">
                  Roadmap
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  14-day
                </p>
                <p className="mt-1 text-xs sm:text-sm text-foreground/60">
                  Free trial
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  Evidence
                </p>
                <p className="mt-1 text-xs sm:text-sm text-foreground/60">
                  first
                </p>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative hidden lg:block lg:self-start lg:mt-4">
            <div className="absolute -top-4 -right-4 h-full w-full rounded-2xl bg-primary/20" />
            <div className="relative grid grid-cols-2 gap-3 sm:gap-4 rounded-2xl bg-white p-4 sm:p-6 shadow-xl">
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-muted p-4 sm:p-6">
                <Mountain className="h-8 sm:h-10 w-8 sm:w-10 text-primary" />
                <p className="text-center text-xs sm:text-sm font-medium text-foreground">
                  Race Operations
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-muted p-4 sm:p-6">
                <Leaf className="h-8 sm:h-10 w-8 sm:w-10 text-primary" />
                <p className="text-center text-xs sm:text-sm font-medium text-foreground">
                  Sustainability
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-muted p-4 sm:p-6">
                <Users className="h-8 sm:h-10 w-8 sm:w-10 text-primary" />
                <p className="text-center text-xs sm:text-sm font-medium text-foreground">
                  Community
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-primary p-4 sm:p-6">
                <span className="text-xl sm:text-2xl font-bold text-primary-foreground">
                  TNZ
                </span>
                <p className="text-center text-xs sm:text-sm font-medium text-primary-foreground">
                  Trail Net Zero
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
