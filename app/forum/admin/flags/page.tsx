import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'

export default async function ForumFlagsPage() {
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect('/auth/sign-in?redirect=/forum/admin/flags')
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_forum_admin')
  if (adminErr || !isAdmin) redirect('/forum')

  const { data: flags } = await supabase
    .from('forum_post_flags')
    .select(
      'id, reason, created_at, user_id, post:forum_posts(id, thread_id, body, author_id, created_at, thread:forum_threads(id, title, category_id))',
    )
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 md:px-6">
      <p className="text-xs font-medium text-foreground/60">
        <Link className="hover:text-primary" href="/forum">
          Forum
        </Link>{" "}
        /{" "}
        <Link className="hover:text-primary" href="/forum/admin">
          Admin
        </Link>{" "}
        / Reported Posts
      </p>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Flagged posts</h1>
        <p className="text-sm text-foreground/70">
          Review member reports and remove content if needed.
        </p>
      </header>

      <div className="space-y-3">
        {(flags ?? []).map((f: any) => (
          <div
            key={f.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs text-foreground/60">
                  Reported by {String(f.user_id).slice(0, 8)} ·{" "}
                  {new Date(f.created_at).toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {f.post?.thread?.title ?? "Thread"}
                </p>
              </div>
              {f.post?.thread_id && (
                <Link
                  href={`/forum/t/${f.post.thread_id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View thread
                </Link>
              )}
            </div>

            {f.reason && (
              <p className="mt-3 text-sm text-foreground">Reason: {f.reason}</p>
            )}

            {f.post?.body && (
              <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-foreground/80">
                {f.post.body}
              </p>
            )}
          </div>
        ))}

        {(flags ?? []).length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-foreground/70">
            No flags yet.
          </div>
        )}
      </div>
    </section>
  );
}

