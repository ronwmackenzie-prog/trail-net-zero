import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import { Button } from '@/components/ui/button'
import { ThreadActions } from '@/components/forum/thread-actions'
import {
  Archive,
  MessageSquare,
  Pin,
  Lock,
  Trash2,
  AlertCircle,
} from 'lucide-react'

export default async function AdminThreadsPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const { filter } = await (searchParams as any)
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect('/auth/sign-in?redirect=/forum/admin/threads')
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_forum_admin')
  if (adminErr || !isAdmin) redirect('/forum')

  // Fetch all threads including archived and deleted (admin can see all)
  const { data: allThreads, error: threadsError } = await supabase
    .from('forum_threads')
    .select(`
      id,
      title,
      is_pinned,
      is_locked,
      is_deleted,
      is_archived,
      archived_at,
      last_post_at,
      created_at,
      post_count,
      author_id,
      category_id
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  // Log error for debugging
  if (threadsError) {
    console.error('Error fetching threads:', threadsError)
  }

  // Fetch categories separately to avoid join issues
  const { data: categories } = await supabase
    .from('forum_categories')
    .select('id, slug, name')

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c]))

  // Fetch author profiles separately (admins can view all profiles)
  const authorIds = [...new Set((allThreads ?? []).map((t) => t.author_id))]
  const { data: profiles } = authorIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, email')
        .in('id', authorIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  // Split threads by status
  const activeThreads = (allThreads ?? []).filter(
    (t) => !t.is_archived && !t.is_deleted
  )
  const archivedThreads = (allThreads ?? []).filter((t) => t.is_archived)
  const deletedThreads = (allThreads ?? []).filter((t) => t.is_deleted)

  // Determine which threads to display based on filter
  let displayThreads = activeThreads
  let currentFilter = 'active'

  if (filter === 'archived') {
    displayThreads = archivedThreads
    currentFilter = 'archived'
  } else if (filter === 'deleted') {
    displayThreads = deletedThreads
    currentFilter = 'deleted'
  }

  return (
    <section className="flex flex-col gap-6">
      <p className="text-xs font-medium text-foreground/60">
        <Link className="hover:text-primary" href="/forum">
          Forum
        </Link>{' '}
        /{' '}
        <Link className="hover:text-primary" href="/forum/admin">
          Admin
        </Link>{' '}
        / Threads
      </p>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Manage Threads</h1>
          <p className="text-sm text-foreground/70">
            View, archive, delete, and moderate forum threads.
          </p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <Link
          href="/forum/admin/threads"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            currentFilter === 'active'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-foreground'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Active ({activeThreads.length})
        </Link>
        <Link
          href="/forum/admin/threads?filter=archived"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            currentFilter === 'archived'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-foreground'
          }`}
        >
          <Archive className="h-4 w-4" />
          Archived ({archivedThreads.length})
        </Link>
        <Link
          href="/forum/admin/threads?filter=deleted"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            currentFilter === 'deleted'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-foreground'
          }`}
        >
          <Trash2 className="h-4 w-4" />
          Deleted ({deletedThreads.length})
        </Link>
      </div>

      {/* Threads List */}
      <div className="space-y-3">
        {displayThreads.map((thread: any) => (
          <div
            key={thread.id}
            className={`flex flex-col gap-2 rounded-2xl border bg-card px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
              thread.is_deleted
                ? 'border-destructive/30 bg-destructive/5'
                : thread.is_archived
                ? 'border-border/50 opacity-75'
                : 'border-border'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground truncate">
                  {thread.title}
                </p>
                {thread.is_pinned && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                )}
                {thread.is_locked && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Locked
                  </span>
                )}
                {thread.is_archived && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Archive className="h-3 w-3" />
                    Archived
                  </span>
                )}
                {thread.is_deleted && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive flex items-center gap-1">
                    <Trash2 className="h-3 w-3" />
                    Deleted
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-foreground/60">
                {categoryMap.get(thread.category_id)?.name ?? 'Unknown Category'} · {thread.post_count ?? 0} posts ·{' '}
                {new Date(thread.created_at).toLocaleDateString()}
              </p>
              <p className="mt-1 text-xs text-foreground/50">
                By: {profileMap.get(thread.author_id)?.email?.split('@')[0] ?? 'Unknown'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/forum/t/${thread.id}`}>View</Link>
              </Button>
              <ThreadActions
                threadId={thread.id}
                threadTitle={thread.title}
                isArchived={thread.is_archived ?? false}
                isPinned={thread.is_pinned ?? false}
                isLocked={thread.is_locked ?? false}
                isDeleted={thread.is_deleted ?? false}
              />
            </div>
          </div>
        ))}

        {displayThreads.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            {currentFilter === 'archived' ? (
              <>
                <Archive className="h-10 w-10 mx-auto text-foreground/30 mb-3" />
                <p className="text-sm text-foreground/70">No archived threads.</p>
                <p className="text-xs text-foreground/50 mt-1">
                  Archived threads will appear here.
                </p>
              </>
            ) : currentFilter === 'deleted' ? (
              <>
                <Trash2 className="h-10 w-10 mx-auto text-foreground/30 mb-3" />
                <p className="text-sm text-foreground/70">No deleted threads.</p>
                <p className="text-xs text-foreground/50 mt-1">
                  Soft-deleted threads will appear here for recovery or permanent deletion.
                </p>
              </>
            ) : (
              <>
                <MessageSquare className="h-10 w-10 mx-auto text-foreground/30 mb-3" />
                <p className="text-sm text-foreground/70">No active threads.</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
