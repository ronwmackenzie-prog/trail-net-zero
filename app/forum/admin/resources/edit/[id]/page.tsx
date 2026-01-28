import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import { ResourceEditor } from '@/components/forum/resource-editor'

export default async function EditResourcePage({ params }: { params: { id: string } }) {
  const { id } = await (params as any)
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect(`/auth/sign-in?redirect=/forum/admin/resources/edit/${encodeURIComponent(id)}`)
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_forum_admin')
  if (adminErr || !isAdmin) redirect('/forum')

  const { data: resource } = await supabase
    .from('member_resources')
    .select('id, slug, title, excerpt, body, external_url, kind, is_published')
    .eq('id', id)
    .maybeSingle()

  if (!resource) notFound()

  return (
    <section className="flex flex-col gap-6">
      <p className="text-xs font-medium text-foreground/60">
        <Link className="hover:text-primary" href="/forum/admin/resources">
          Admin resources
        </Link>{' '}
        / Edit
      </p>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Edit resource</h1>
        <p className="text-sm text-foreground/70">Update content and publishing status.</p>
      </header>
      <ResourceEditor initial={resource as any} />
    </section>
  )
}

