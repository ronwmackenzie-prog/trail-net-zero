import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getForumAccess } from '@/lib/forum'
import { createClient } from '@/lib/supabase/server'
import { ThreadClient } from '@/components/forum/thread-client'

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const { id } = await (params as any);
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect(`/auth/sign-in?redirect=/forum/t/${encodeURIComponent(id)}`)
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('id, title, is_locked, is_pinned, created_at, category_id')
    .eq('id', id)
    .maybeSingle()

  if (!thread) notFound()

  const [{ data: category }, { data: posts }] = await Promise.all([
    supabase
      .from('forum_categories')
      .select('slug, name')
      .eq('id', thread.category_id)
      .maybeSingle(),
    supabase
      .from('forum_posts')
      .select('id, thread_id, author_id, body, created_at')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true })
      .limit(100),
  ])

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 md:px-6">
      <p className="text-xs font-medium text-foreground/60">
        <Link className="hover:text-primary" href="/forum">
          Forum
        </Link>
        {category?.slug ? (
          <>
            {' '}
            /{' '}
            <Link className="hover:text-primary" href={`/forum/c/${category.slug}`}>
              {category.name}
            </Link>
          </>
        ) : null}
      </p>

      <ThreadClient
        threadId={thread.id}
        threadTitle={thread.title}
        isLocked={thread.is_locked}
        isPinned={thread.is_pinned}
        initialPosts={posts ?? []}
      />
    </section>
  )
}

