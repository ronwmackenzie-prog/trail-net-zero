import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Privacy Policy | Trail Net Zero",
  description: "Privacy policy for Trail Net Zero.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="bg-white">
        <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="mt-4 text-sm leading-relaxed text-foreground/70">
            This site is being actively developed. This page will be updated
            with a full privacy policy covering data collection, cookies,
            analytics, and account information.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-foreground/70">
            For questions in the meantime, contact{" "}
            <a className="font-medium text-primary underline-offset-4 hover:underline" href="mailto:info@trailnetzero.com">
              info@trailnetzero.com
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

