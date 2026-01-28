'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type Category = {
  id: string
  slug: string
  name: string
}

export function NewThreadForm({
  categories,
  initialCategorySlug,
}: {
  categories: Category[]
  initialCategorySlug?: string
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const initialCategoryId =
    categories.find((c) => c.slug === initialCategorySlug)?.id ?? categories[0]?.id ?? ''

  const [categoryId, setCategoryId] = useState(initialCategoryId)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (saving) return
    const t = title.trim()
    const b = body.trim()
    if (!categoryId || t.length < 6 || b.length < 10) return
    setSaving(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth.user?.id
      if (!userId) {
        router.push('/auth/sign-in?redirect=/forum/new')
        return
      }

      const { data: thread, error: threadErr } = await supabase
        .from('forum_threads')
        .insert({
          category_id: categoryId,
          author_id: userId,
          title: t,
        })
        .select('id')
        .single()

      if (threadErr) throw threadErr

      const { error: postErr } = await supabase.from('forum_posts').insert({
        thread_id: thread.id,
        author_id: userId,
        body: b,
      })
      if (postErr) throw postErr

      router.push(`/forum/t/${thread.id}`)
      router.refresh()
    } catch (e) {
      console.error('Failed to create thread', e)
      alert('Could not create thread. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={saving}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Clear, specific, and searchable…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
          />
          <p className="text-xs text-foreground/60">Aim for 6–120 characters.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="body">First post</Label>
          <Textarea
            id="body"
            placeholder="Context, constraints, what you tried, and what you need…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={saving}
            className="min-h-40"
          />
          <p className="text-xs text-foreground/60">Be specific; numbers and suppliers help.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" type="button" onClick={() => router.push('/forum')} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={saving || !categoryId || title.trim().length < 6 || body.trim().length < 10}
          >
            {saving ? 'Creating…' : 'Create thread'}
          </Button>
        </div>
      </div>
    </div>
  )
}

