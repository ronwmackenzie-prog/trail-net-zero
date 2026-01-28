import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import { Button } from '@/components/ui/button'

export default async function AdminResourcesPage() {
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect('/auth/sign-in?redirect=/forum/admin/resources')
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_forum_admin')
  if (adminErr || !isAdmin) redirect('/forum')

  const { data: resources } = await supabase
    .from('member_resources')
    .select('id, slug, title, is_published, published_at, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <section className="flex flex-col gap-6">
      <p className="text-xs font-medium text-foreground/60">
        <Link className="hover:text-primary" href="/forum">
          Forum
        </Link>{' '}
        / Admin / Resources
      </p>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Manage resources</h1>
          <p className="text-sm text-foreground/70">
            Create member-only articles and links as a membership perk.
          </p>
        </div>
        <Button asChild>
          <Link href="/forum/admin/resources/new">New resource</Link>
        </Button>
      </header>

      <div className="space-y-3">
        {(resources ?? []).map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{r.title}</p>
              <p className="mt-1 text-xs text-foreground/60">
                {r.is_published ? 'Published' : 'Draft'} ·{' '}
                {new Date((r.published_at ?? r.created_at) as string).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-foreground/60">Slug: {r.slug}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/forum/resources/${r.slug}`}>View</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/forum/admin/resources/edit/${r.id}`}>Edit</Link>
              </Button>
            </div>
          </div>
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

