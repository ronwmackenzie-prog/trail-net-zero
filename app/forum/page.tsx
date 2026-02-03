import Link from "next/link";
import { createCheckoutSession } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { getForumAccess } from "@/lib/forum";
import { createClient } from "@/lib/supabase/server";
import { getPlaceholderThreadsForForum } from "@/lib/forum-placeholders";
import {
  FileText,
  Link as LinkIcon,
  Bell,
  Newspaper,
  BookOpen,
} from "lucide-react";

const KIND_ICONS: Record<string, typeof FileText> = {
  article: FileText,
  link: LinkIcon,
  update: Bell,
  newsletter: Newspaper,
  guide: BookOpen,
};

export const metadata = {
  title: "Forum | Trail Net Zero",
  description:
    "Community discussions on trail running sustainability. Explore topics on race operations, apparel, nutrition, and environmental stewardship.",
};

export default async function ForumPage() {
  const { user, hasAccess } = await getForumAccess();

  // Public preview (audit request): allow visitors to understand the forum before sign-up.
  if (!user) {
    const previewCategories = [
      { slug: "race-operations", name: "Race operations" },
      { slug: "apparel-footwear", name: "Apparel & footwear" },
      { slug: "sports-nutrition", name: "Sports nutrition" },
      { slug: "land-stewardship", name: "Land stewardship" },
      { slug: "data-standards", name: "Data & standards" },
      { slug: "working-groups", name: "Working groups" },
    ];

    const previewThreads = getPlaceholderThreadsForForum(previewCategories)
      .sort(
        (a, b) =>
          new Date(b.lastActivityAt).getTime() -
          new Date(a.lastActivityAt).getTime(),
      )
      .slice(0, 6);

    return (
      <section className="flex flex-col gap-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Forum preview
          </p>
          <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            A practitioner forum for trail running sustainability
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-foreground/70">
            Trail Net Zero is a professional sustainability community for trail
            running. Members collaborate on pilots, share documentation, and
            build systems that move the trail running ecosystem toward net-zero
            outcomes over the next 15 years.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild>
              <Link href="/join">Start a 14-day free trial</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/sign-in?redirect=/forum">
                Sign in to view member content
              </Link>
            </Button>
          </div>
        </header>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Topics you’ll find inside
          </h2>
          <div className="flex flex-wrap gap-2">
            {previewCategories.map((cat) => (
              <Link
                key={cat.slug}
                href="/join"
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <p className="text-sm text-foreground/70">
            Want to understand how claims are evaluated? Read{" "}
            <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/standards">
              Standards &amp; Evidence
            </Link>{" "}
            and{" "}
            <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/roadmap">
              the 15-year Roadmap
            </Link>
            .
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Example threads (preview)
          </h2>
          <div className="space-y-3">
            {previewThreads.map((p) => (
              <div
                key={p.key}
                className="rounded-2xl border border-dashed border-border bg-card px-5 py-4"
              >
                <p className="text-xs text-foreground/60">{p.categoryName}</p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {p.title}
                </p>
                <p className="mt-2 text-xs text-foreground/60">
                  {p.meta} · {p.replies} replies ·{" "}
                  {`Last activity: ${new Date(p.lastActivityAt).toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!hasAccess) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col gap-6 py-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Member Forum</h1>
          <p className="text-sm text-foreground/70">
            Your free trial may have ended, or your subscription isn&apos;t
            active. Upgrade to continue participating for $15/month.
          </p>
        </header>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Upgrade required
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            Your account doesn&apos;t currently include forum access.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <form action={createCheckoutSession}>
              <Button type="submit">Upgrade to full membership</Button>
            </form>
            <Button asChild variant="outline">
              <Link href="/account">Manage billing</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("forum_categories")
    .select("id, slug, name")
    .order("position", { ascending: true });

  const { data: recentResources } = await supabase
    .from("member_resources")
    .select("id, slug, title, kind, published_at, created_at")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: latestThreads } = await supabase
    .from("forum_threads")
    .select("id, title, last_post_at, created_at, forum_categories(slug, name)")
    .eq("is_deleted", false)
    .order("last_post_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(8);

  const placeholderThreads = getPlaceholderThreadsForForum(
    (categories ?? []).map((c: any) => ({ slug: c.slug, name: c.name })),
  )
    .sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime(),
    )
    .slice(0, 6);

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Member Forum</h1>
          <p className="max-w-2xl text-sm text-foreground/70">
            Categories, threads, and working-group discussions. New replies
            appear in real time when you&apos;re viewing a thread.
          </p>
        </div>
        <Button asChild>
          <Link href="/forum/new">Start a new thread</Link>
        </Button>
      </header>

      {/* Compact Categories */}
      <div className="flex flex-wrap gap-2">
        {(categories ?? []).map((cat) => (
          <Link
            key={cat.id}
            href={`/forum/c/${cat.slug}`}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Resources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Resources</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/forum/resources">View all</Link>
          </Button>
        </div>
        {(recentResources ?? []).length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {(recentResources ?? []).map((r: any) => {
              const Icon = KIND_ICONS[r.kind] ?? FileText;
              return (
                <Link
                  key={r.id}
                  href={`/forum/resources/${r.slug}`}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-2 text-xs text-foreground/60">
                    <Icon className="h-3.5 w-3.5" />
                    {new Date(
                      (r.published_at ?? r.created_at) as string,
                    ).toLocaleDateString()}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground line-clamp-2">
                    {r.title}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground/70">
            No resources yet. Check back soon!
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Latest threads
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/forum/threads">View all</Link>
          </Button>
        </div>
        <div className="space-y-3">
          {(latestThreads ?? []).map((t: any) => (
            <Link
              key={t.id}
              href={`/forum/t/${t.id}`}
              className="block rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <p className="text-xs text-foreground/60">
                {t.forum_categories?.name ?? "Category"}
              </p>
              <p className="mt-1 text-base font-semibold text-foreground">
                {t.title}
              </p>
              <p className="mt-2 text-xs text-foreground/60">
                {t.last_post_at
                  ? `Last activity: ${new Date(t.last_post_at).toLocaleString()}`
                  : `Created: ${new Date(t.created_at).toLocaleString()}`}
              </p>
            </Link>
          ))}
          {(latestThreads ?? []).length === 0 && (
            <>
              <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-foreground/70">
                Example threads (sample). Create real threads to replace these.
              </div>
              {placeholderThreads.map((p) => (
                <div
                  key={p.key}
                  className="rounded-2xl border border-dashed border-border bg-card px-5 py-4"
                >
                  <p className="text-xs text-foreground/60">{p.categoryName}</p>
                  <p className="mt-1 text-base font-semibold text-foreground">
                    {p.title}
                  </p>
                  <p className="mt-2 text-xs text-foreground/60">
                    {p.meta} · {p.replies} replies ·{" "}
                    {`Last activity: ${new Date(p.lastActivityAt).toLocaleString()}`}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
