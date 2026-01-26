import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ContactHero } from "@/components/contact/contact-hero"
import { ContactForm } from "@/components/contact/contact-form"
import { ContactInfo } from "@/components/contact/contact-info"
import { Faq } from "@/components/contact/faq"

export const metadata = {
  title: "Contact | Trail Net Zero",
  description: "Get in touch with the Trail Net Zero team. Questions about membership, partnerships, or community guidelines.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <ContactHero />
        <div className="py-16 md:py-24 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 md:gap-12 px-4 md:px-6 lg:grid-cols-2">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
