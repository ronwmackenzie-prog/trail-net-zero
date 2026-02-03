import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import { ThreadFilters } from '@/components/forum/thread-filters'
import { getPlaceholderThreadsForForum } from '@/lib/forum-placeholders'

export default async function ThreadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ sort?: string; category?: string }>
}) {
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect('/auth/sign-in?redirect=/forum/threads')
  if (!hasAccess) redirect('/forum')

  const sp = (await (searchParams as any)) ?? {}
  const sort = (sp.sort ?? 'latest') as string
  const categorySlug = (sp.category ?? 'all') as string

  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('forum_categories')
    .select('id, slug, name')
    .order('position', { ascending: true })

  let query = supabase
    .from('forum_threads')
    .select('id, title, is_pinned, is_locked, created_at, last_post_at, post_count, forum_categories(slug, name)')
    .eq('is_deleted', false)

  if (categorySlug !== 'all') {
    const categoryId = (categories ?? []).find((c) => c.slug === categorySlug)?.id
    if (categoryId) query = query.eq('category_id', categoryId)
  }

  if (sort === 'featured') {
    query = query.eq('is_pinned', true).order('last_post_at', { ascending: false, nullsFirst: false })
  } else if (sort === 'popular') {
    query = query.order('post_count', { ascending: false }).order('last_post_at', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('last_post_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })
  }

  const { data: threads } = await query.limit(100)
  const placeholderBase = getPlaceholderThreadsForForum((categories ?? []) as any)
  const placeholders =
    categorySlug === 'all'
      ? placeholderBase
      : placeholderBase.filter((p) => p.categorySlug === categorySlug)

  const sortedPlaceholders = (() => {
    if (sort === 'featured') return placeholders.filter((p) => p.pinned)
    if (sort === 'popular') return [...placeholders].sort((a, b) => b.replies - a.replies)
    return [...placeholders].sort(
      (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
    )
  })()

  return (
    <section className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Threads</h1>
        <p className="text-sm text-foreground/70">
          Browse discussions across the forum. Sort by latest activity, popularity, or featured.
        </p>
      </header>

      <ThreadFilters categories={(categories ?? []) as any} />

      <div className="space-y-3">
        {(threads ?? []).map((t: any) => {
          const replies = Math.max((t.post_count ?? 0) - 1, 0)
          const catName = t.forum_categories?.name
          const catSlug = t.forum_categories?.slug
          return (
            <Link
              key={t.id}
              href={`/forum/t/${t.id}`}
              className="block rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2">
                {t.is_pinned && (
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Featured
                  </span>
                )}
                {t.is_locked && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground/70">
                    Locked
                  </span>
                )}
                {catName && catSlug ? (
                  <Link
                    href={`/forum/c/${catSlug}`}
                    className="text-xs font-medium text-foreground/60 hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {catName}
                  </Link>
                ) : null}
              </div>
              <h2 className="mt-2 text-base font-semibold text-foreground">{t.title}</h2>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-foreground/60">
                <span>{replies} replies</span>
                <span>
                  {t.last_post_at
                    ? `Last activity: ${new Date(t.last_post_at).toLocaleString()}`
                    : `Created: ${new Date(t.created_at).toLocaleString()}`}
                </span>
              </div>
            </Link>
          )
        })}

        {(threads ?? []).length === 0 && sortedPlaceholders.length > 0 && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-foreground/70">
              Example threads (sample). Create real threads to replace these.
            </div>
            {sortedPlaceholders.map((p) => (
              <div
                key={p.key}
                className="rounded-2xl border border-dashed border-border bg-card px-5 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {p.pinned && (
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Featured
                    </span>
                  )}
                  {p.locked && (
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground/70">
                      Locked
                    </span>
                  )}
                  <Link
                    href={`/forum/c/${p.categorySlug}`}
                    className="text-xs font-medium text-foreground/60 hover:text-primary"
                  >
                    {p.categoryName}
                  </Link>
                  <span className="text-xs text-foreground/60">{p.meta}</span>
                </div>
                <p className="mt-2 text-base font-semibold text-foreground">{p.title}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-foreground/60">
                  <span>{p.replies} replies</span>
                  <span>{`Last activity: ${new Date(p.lastActivityAt).toLocaleString()}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {(threads ?? []).length === 0 && sortedPlaceholders.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-foreground/70">
            No threads match your filters yet.
          </div>
        )}
      </div>
    </section>
  )
}

