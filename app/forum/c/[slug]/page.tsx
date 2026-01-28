import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getForumAccess } from '@/lib/forum'
import { createClient } from '@/lib/supabase/server'
import { getPlaceholderThreadsForCategory } from "@/lib/forum-placeholders";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = await (params as any);
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect(`/auth/sign-in?redirect=/forum/c/${encodeURIComponent(slug)}`)

  if (!hasAccess) {
    redirect('/forum')
  }

  const supabase = await createClient()

  const { data: category } = await supabase
    .from('forum_categories')
    .select('id, slug, name, description')
    .eq('slug', slug)
    .maybeSingle()

  if (!category) notFound()

  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id, title, is_pinned, is_locked, last_post_at, created_at')
    .eq('category_id', category.id)
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('last_post_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(50)

  const placeholders = getPlaceholderThreadsForCategory(category.slug);

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:px-6">
      <header className="space-y-2">
        <p className="text-xs font-medium text-foreground/60">
          <Link className="hover:text-primary" href="/forum">
            Forum
          </Link>{" "}
          / {category.name}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">
              {category.name}
            </h1>
            {category.description && (
              <p className="max-w-2xl text-sm text-foreground/70">
                {category.description}
              </p>
            )}
          </div>
          <Button asChild>
            <Link
              href={`/forum/new?category=${encodeURIComponent(category.slug)}`}
            >
              New thread
            </Link>
          </Button>
        </div>
      </header>

      <div className="space-y-3">
        {(threads ?? []).map((t) => (
          <Link
            key={t.id}
            href={`/forum/t/${t.id}`}
            className="block rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center gap-2">
              {t.is_pinned && (
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Pinned
                </span>
              )}
              {t.is_locked && (
                <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground/70">
                  Locked
                </span>
              )}
            </div>
            <h2 className="mt-2 text-base font-semibold text-foreground">
              {t.title}
            </h2>
            <p className="mt-2 text-xs text-foreground/60">
              {t.last_post_at
                ? `Last activity: ${new Date(t.last_post_at).toLocaleString()}`
                : ""}
            </p>
          </Link>
        ))}

        {(threads ?? []).length === 0 && placeholders.length > 0 && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-foreground/70">
              Example threads (placeholders). Create a real thread to replace
              these.
            </div>
            {placeholders.map((t) => (
              <div
                key={t.title}
                className="rounded-2xl border border-dashed border-border bg-card px-5 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {t.pinned && (
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Pinned
                    </span>
                  )}
                  {t.locked && (
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground/70">
                      Locked
                    </span>
                  )}
                  <span className="text-xs text-foreground/60">{t.meta}</span>
                </div>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {t.title}
                </p>
                <p className="mt-2 text-xs text-foreground/60">
                  This is a placeholder to demonstrate structure.
                </p>
              </div>
            ))}
          </div>
        )}

        {(threads ?? []).length === 0 && placeholders.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-foreground/70">
            No threads yet. Start the first one.
          </div>
        )}
      </div>
    </section>
  );
}

