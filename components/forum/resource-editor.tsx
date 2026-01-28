'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type Resource = {
  id?: string
  slug: string
  title: string
  excerpt?: string | null
  body?: string | null
  external_url?: string | null
  kind: string
  is_published: boolean
}

export function ResourceEditor({ initial }: { initial: Resource }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [form, setForm] = useState<Resource>(initial)
  const [saving, setSaving] = useState(false)

  const update = (patch: Partial<Resource>) => setForm((p) => ({ ...p, ...patch }))

  const save = async () => {
    if (saving) return
    if (!form.slug.trim() || !form.title.trim()) return
    setSaving(true)
    try {
      const payload: any = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        excerpt: form.excerpt?.trim() || null,
        body: form.body?.trim() || null,
        external_url: form.external_url?.trim() || null,
        kind: form.kind,
        is_published: !!form.is_published,
        published_at: form.is_published ? new Date().toISOString() : null,
      }

      if (form.id) {
        const { error } = await supabase.from('member_resources').update(payload).eq('id', form.id)
        if (error) throw error
      } else {
        const { data: auth } = await supabase.auth.getUser()
        payload.created_by = auth.user?.id ?? null
        const { error } = await supabase.from('member_resources').insert(payload)
        if (error) throw error
      }

      router.push('/forum/admin/resources')
      router.refresh()
    } catch (e) {
      console.error('Failed to save resource', e)
      alert('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!form.id) return
    const ok = confirm('Delete this resource? This cannot be undone.')
    if (!ok) return
    setSaving(true)
    try {
      const { error } = await supabase.from('member_resources').delete().eq('id', form.id)
      if (error) throw error
      router.push('/forum/admin/resources')
      router.refresh()
    } catch (e) {
      console.error('Failed to delete resource', e)
      alert('Could not delete. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => update({ slug: e.target.value })}
            placeholder="short-url-friendly-slug"
            disabled={saving}
          />
          <p className="text-xs text-foreground/60">
            Used in the URL: <span className="font-mono">/forum/resources/{'{slug}'}</span>
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Title"
            disabled={saving}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={form.excerpt ?? ''}
            onChange={(e) => update({ excerpt: e.target.value })}
            placeholder="Short summary shown in the list."
            disabled={saving}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="kind">Kind</Label>
          <select
            id="kind"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={form.kind}
            onChange={(e) => update({ kind: e.target.value })}
            disabled={saving}
          >
            <option value="article">article</option>
            <option value="link">link</option>
            <option value="update">update</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="external_url">External URL (optional)</Label>
          <Input
            id="external_url"
            value={form.external_url ?? ''}
            onChange={(e) => update({ external_url: e.target.value })}
            placeholder="https://..."
            disabled={saving}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="body">Body</Label>
          <Textarea
            id="body"
            className="min-h-56"
            value={form.body ?? ''}
            onChange={(e) => update({ body: e.target.value })}
            placeholder="Write the content (markdown-friendly text is fine for now)."
            disabled={saving}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => update({ is_published: e.target.checked })}
            disabled={saving}
          />
          Published (visible to members)
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {form.id ? (
            <Button type="button" variant="outline" onClick={remove} disabled={saving}>
              Delete
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => router.push('/forum/admin/resources')} disabled={saving}>
              Cancel
            </Button>
          )}
          <Button type="button" onClick={save} disabled={saving || !form.slug.trim() || !form.title.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}

