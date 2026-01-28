'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type PostRow = {
  id: string
  thread_id: string
  author_id: string
  body: string
  created_at: string
}

export function ThreadClient({
  threadId,
  threadTitle,
  isLocked,
  isPinned,
  initialPosts,
}: {
  threadId: string
  threadTitle: string
  isLocked: boolean
  isPinned: boolean
  initialPosts: PostRow[]
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [posts, setPosts] = useState<PostRow[]>(initialPosts)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [locked, setLocked] = useState(isLocked)
  const [pinned, setPinned] = useState(isPinned)
  const idsRef = useRef(new Set(initialPosts.map((p) => p.id)))

  useEffect(() => {
    const loadAdmin = async () => {
      const { data, error } = await supabase.rpc('is_forum_admin')
      if (!error) setAdmin(!!data)
    }
    void loadAdmin()
  }, [supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`thread:${threadId}:posts`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_posts',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const next = payload.new as PostRow
          if (!next?.id || idsRef.current.has(next.id)) return
          idsRef.current.add(next.id)
          setPosts((prev) => [...prev, next])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, threadId])

  const toggleLock = async () => {
    if (!admin) return
    try {
      const next = !locked
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_locked: next })
        .eq('id', threadId)
      if (error) throw error
      setLocked(next)
      router.refresh()
    } catch (e) {
      console.error('Failed to toggle lock', e)
      alert('Could not update thread. Please try again.')
    }
  }

  const deleteThread = async () => {
    if (!admin) return
    const ok = confirm('Soft-delete this thread? It will disappear for members.')
    if (!ok) return
    try {
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_deleted: true })
        .eq('id', threadId)
      if (error) throw error
      router.push('/forum')
      router.refresh()
    } catch (e) {
      console.error('Failed to delete thread', e)
      alert('Could not delete thread. Please try again.')
    }
  }

  const togglePin = async () => {
    if (!admin) return
    try {
      const next = !pinned
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_pinned: next })
        .eq('id', threadId)
      if (error) throw error
      setPinned(next)
      router.refresh()
    } catch (e) {
      console.error('Failed to toggle pin', e)
      alert('Could not update thread. Please try again.')
    }
  }

  const send = async () => {
    if (sending || locked) return
    const trimmed = body.trim()
    if (!trimmed) return
    setSending(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth.user?.id
      if (!userId) {
        router.push(`/auth/sign-in?redirect=/forum/t/${encodeURIComponent(threadId)}`)
        return
      }

      const { error } = await supabase.from('forum_posts').insert({
        thread_id: threadId,
        author_id: userId,
        body: trimmed,
      })

      if (error) throw error
      setBody('')
    } catch (e) {
      console.error('Failed to post', e)
      // Keep it simple for now; no toast system wired here yet.
      alert('Could not post. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const reportPost = async (postId: string) => {
    const reason = prompt('Report reason (optional):') ?? ''
    try {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth.user?.id
      if (!userId) return
      const { error } = await supabase.from('forum_post_flags').insert({
        post_id: postId,
        user_id: userId,
        reason: reason.trim() || null,
      })
      if (error) throw error
      alert('Reported. Thanks for helping keep the forum useful.')
    } catch (e) {
      console.error('Failed to report post', e)
      alert('Could not report. Please try again.')
    }
  }

  const deletePost = async (postId: string) => {
    if (!admin) return
    const ok = confirm('Soft-delete this post?')
    if (!ok) return
    try {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth.user?.id
      if (!userId) return
      const { error } = await supabase
        .from('forum_posts')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: userId,
        })
        .eq('id', postId)
      if (error) throw error
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch (e) {
      console.error('Failed to delete post', e)
      alert('Could not delete post. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">{threadTitle}</h1>
            {locked && (
              <p className="text-xs font-medium text-foreground/60">
                This thread is locked. You can still read, but cannot reply.
              </p>
            )}
            {pinned && (
              <p className="text-xs font-medium text-primary">Pinned thread</p>
            )}
          </div>

          {admin && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={togglePin}>
                {pinned ? 'Unpin' : 'Pin'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={toggleLock}>
                {locked ? 'Unlock' : 'Lock'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={deleteThread}>
                Delete thread
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="space-y-3">
        {posts.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-foreground/70">
                Member {p.author_id.slice(0, 8)}
              </p>
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => reportPost(p.id)}>
                  Report
                </Button>
                {admin && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => deletePost(p.id)}>
                    Delete
                  </Button>
                )}
                <time className="text-xs text-foreground/60">
                  {new Date(p.created_at).toLocaleString()}
                </time>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{p.body}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Reply</h2>
        <Textarea
          className="mt-3"
          placeholder={locked ? 'Thread is locked' : 'Write a reply…'}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={sending || locked}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-foreground/60">
            Keep it concrete: share what worked, numbers, vendors, constraints.
          </p>
          <Button type="button" onClick={send} disabled={sending || locked || !body.trim()}>
            {sending ? 'Posting…' : 'Post reply'}
          </Button>
        </div>
      </section>
    </div>
  )
}

