import { MessageSquare, Users, Clock, Lock } from "lucide-react"

const discussions = [
  {
    title: "Cup washing stations: lessons from 2025 race season",
    category: "Race Operations",
    author: "Sarah M.",
    replies: 24,
    participants: 12,
    lastActivity: "2 hours ago",
    isPinned: true,
  },
  {
    title: "Comparing biodegradable vs reusable race bibs",
    category: "Race Operations",
    author: "David K.",
    replies: 18,
    participants: 9,
    lastActivity: "5 hours ago",
    isPinned: false,
  },
  {
    title: "New recycled polyester certifications: what they actually mean",
    category: "Apparel & Footwear",
    author: "Maria L.",
    replies: 31,
    participants: 15,
    lastActivity: "8 hours ago",
    isPinned: false,
  },
  {
    title: "Trail erosion monitoring: tech solutions that work",
    category: "Land Stewardship",
    author: "James R.",
    replies: 14,
    participants: 7,
    lastActivity: "12 hours ago",
    isPinned: false,
  },
  {
    title: "Gel packet alternatives: pilot results from Q4",
    category: "Sports Nutrition",
    author: "Emma T.",
    replies: 27,
    participants: 14,
    lastActivity: "1 day ago",
    isPinned: false,
  },
  {
    title: "Carbon footprint calculation methodology discussion",
    category: "LCA & Data",
    author: "Michael P.",
    replies: 42,
    participants: 19,
    lastActivity: "1 day ago",
    isPinned: false,
  },
]

export function RecentDiscussions() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--section-light-blue)' }}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Recent Discussions</h2>
            <p className="mt-2 text-foreground/70">
              A preview of active conversations in the community.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white border border-border px-3 py-1.5 text-sm text-foreground/70 w-fit">
            <Lock className="h-4 w-4" />
            <span>Members only</span>
          </div>
        </div>

        <div className="mt-10 space-y-3">
          {discussions.map((discussion) => (
            <div
              key={discussion.title}
              className="group rounded-xl border border-border bg-white p-5 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {discussion.isPinned && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Pinned
                      </span>
                    )}
                    <span className="text-xs text-foreground/60">{discussion.category}</span>
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground group-hover:text-primary">
                    {discussion.title}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/70">
                    Started by {discussion.author}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    <span>{discussion.replies}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{discussion.participants}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span className="whitespace-nowrap">{discussion.lastActivity}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-foreground/70">
            Showing 6 of 245 active discussions. Join the community to access all threads.
          </p>
        </div>
      </div>
    </section>
  )
}
