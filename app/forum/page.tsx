import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ForumHero } from "@/components/forum/forum-hero"
import { DiscussionCategories } from "@/components/forum/discussion-categories"
import { RecentDiscussions } from "@/components/forum/recent-discussions"
import { ForumCta } from "@/components/forum/forum-cta"

export const metadata = {
  title: "Forum | Trail Net Zero",
  description: "Community discussions on trail running sustainability. Explore topics on race operations, apparel, nutrition, and environmental stewardship.",
}

export default function ForumPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <ForumHero />
        <DiscussionCategories />
        <RecentDiscussions />
        <ForumCta />
      </main>
      <Footer />
    </div>
  )
}
