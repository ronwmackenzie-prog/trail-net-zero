import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getForumAccess } from '@/lib/forum'
import { createClient } from '@/lib/supabase/server'
import { NewThreadForm } from '@/components/forum/new-thread-form'

export default async function NewThreadPage({
  searchParams,
}: {
  searchParams?: { category?: string }
}) {
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect('/auth/sign-in?redirect=/forum/new')
  if (!hasAccess) redirect('/forum')

  const initialCategorySlug = searchParams?.category

  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('forum_categories')
    .select('id, slug, name')
    .order('position', { ascending: true })

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 md:px-6">
      <p className="text-xs font-medium text-foreground/60">
        <Link className="hover:text-primary" href="/forum">
          Forum
        </Link>{' '}
        / New thread
      </p>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Start a new thread</h1>
        <p className="text-sm text-foreground/70">
          Use a specific title so others can find and reuse the discussion later.
        </p>
      </header>

      <NewThreadForm categories={categories ?? []} initialCategorySlug={initialCategorySlug} />
    </section>
  )
}

