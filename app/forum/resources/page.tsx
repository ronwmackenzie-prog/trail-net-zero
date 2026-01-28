import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import { Button } from '@/components/ui/button'

export default async function ResourcesPage() {
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect('/auth/sign-in?redirect=/forum/resources')
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()
  const { data: isAdmin } = await supabase.rpc('is_forum_admin')

  const { data: resources } = await supabase
    .from('member_resources')
    .select('id, slug, title, excerpt, kind, published_at, created_at')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Resources</h1>
          <p className="max-w-2xl text-sm text-foreground/70">
            Member-only articles, templates, and reference material curated by the admins.
          </p>
        </div>
        {isAdmin ? (
          <Button asChild variant="outline">
            <Link href="/forum/admin/resources">Admin: manage resources</Link>
          </Button>
        ) : null}
      </header>

      <div className="space-y-3">
        {(resources ?? []).map((r) => (
          <Link
            key={r.id}
            href={`/forum/resources/${r.slug}`}
            className="block rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-foreground/60">{r.kind}</p>
              <p className="text-xs text-foreground/60">
                {new Date((r.published_at ?? r.created_at) as string).toLocaleDateString()}
              </p>
            </div>
            <h2 className="mt-2 text-base font-semibold text-foreground">{r.title}</h2>
            {r.excerpt ? (
              <p className="mt-2 text-sm text-foreground/70">{r.excerpt}</p>
            ) : null}
          </Link>
        ))}

        {(resources ?? []).length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-foreground/70">
            No resources yet.
          </div>
        )}
      </div>
    </section>
  )
}

