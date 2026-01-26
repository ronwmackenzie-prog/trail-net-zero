import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { PrinciplesSection } from "@/components/home/principles-section"
import { AudienceSection } from "@/components/home/audience-section"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { JoinSection } from "@/components/home/join-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <PrinciplesSection />
        <AudienceSection />
        <HowItWorksSection />
        <JoinSection />
      </main>
      <Footer />
    </div>
  )
}
