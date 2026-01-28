import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'

export default async function ResourceDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = await (params as any)
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect(`/auth/sign-in?redirect=/forum/resources/${encodeURIComponent(slug)}`)
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()
  const { data: resource } = await supabase
    .from('member_resources')
    .select('id, slug, title, excerpt, body, external_url, kind, published_at, created_at')
    .eq('slug', slug)
    .maybeSingle()

  if (!resource) notFound()

  return (
    <section className="flex flex-col gap-6">
      <p className="text-xs font-medium text-foreground/60">
        <Link className="hover:text-primary" href="/forum/resources">
          Resources
        </Link>{' '}
        / {resource.title}
      </p>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{resource.title}</h1>
        {resource.excerpt ? <p className="text-sm text-foreground/70">{resource.excerpt}</p> : null}
        <p className="text-xs text-foreground/60">
          {new Date((resource.published_at ?? resource.created_at) as string).toLocaleString()} ·{' '}
          {resource.kind}
        </p>
      </header>

      {resource.external_url ? (
        <div className="rounded-2xl border border-border bg-card p-5 text-sm">
          External link:{' '}
          <a className="font-medium text-primary hover:underline" href={resource.external_url}>
            {resource.external_url}
          </a>
        </div>
      ) : null}

      {resource.body ? (
        <article className="prose prose-neutral max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap">{resource.body}</pre>
        </article>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-foreground/70">
          No content yet.
        </div>
      )}
    </section>
  )
}

