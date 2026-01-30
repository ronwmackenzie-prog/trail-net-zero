import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FolderTree,
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  MessageSquare,
} from 'lucide-react'

async function createCategory(formData: FormData) {
  'use server'
  const supabase = await createClient()
  
  const { data: isAdmin } = await supabase.rpc('is_forum_admin')
  if (!isAdmin) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const position = parseInt(formData.get('position') as string) || 0

  const { error } = await supabase.from('forum_categories').insert({
    name,
    slug,
    description: description || null,
    position,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/forum/admin/categories')
}

async function updateCategory(formData: FormData) {
  'use server'
  const supabase = await createClient()
  
  const { data: isAdmin } = await supabase.rpc('is_forum_admin')
  if (!isAdmin) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const position = parseInt(formData.get('position') as string) || 0

  const { error } = await supabase
    .from('forum_categories')
    .update({
      name,
      slug,
      description: description || null,
      position,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/forum/admin/categories')
}

async function deleteCategory(formData: FormData) {
  'use server'
  const supabase = await createClient()
  
  const { data: isAdmin } = await supabase.rpc('is_forum_admin')
  if (!isAdmin) throw new Error('Unauthorized')

  const id = formData.get('id') as string

  // Check if category has threads
  const { count } = await supabase
    .from('forum_threads')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    throw new Error('Cannot delete category with existing threads. Move or delete threads first.')
  }

  const { error } = await supabase.from('forum_categories').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/forum/admin/categories')
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: { edit?: string; new?: string }
}) {
  const params = await (searchParams as any)
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect('/auth/sign-in?redirect=/forum/admin/categories')
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_forum_admin')
  if (adminErr || !isAdmin) redirect('/forum')

  // Fetch all categories with thread counts
  const { data: categories } = await supabase
    .from('forum_categories')
    .select('id, slug, name, description, position')
    .order('position', { ascending: true })

  // Get thread counts for each category
  const categoriesWithCounts = await Promise.all(
    (categories ?? []).map(async (cat) => {
      const { count } = await supabase
        .from('forum_threads')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('is_deleted', false)
      return { ...cat, threadCount: count ?? 0 }
    })
  )

  const editingCategory = params.edit
    ? categoriesWithCounts.find((c) => c.id === params.edit)
    : null

  const showNewForm = params.new === 'true'

  // Calculate next position for new category
  const nextPosition =
    categoriesWithCounts.length > 0
      ? Math.max(...categoriesWithCounts.map((c) => c.position)) + 10
      : 10

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
        / Categories
      </p>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Manage Categories</h1>
          <p className="text-sm text-foreground/70">
            Create and organize forum categories for discussions.
          </p>
        </div>
        {!showNewForm && !editingCategory && (
          <Button asChild>
            <Link href="/forum/admin/categories?new=true" className="gap-2">
              <Plus className="h-4 w-4" />
              New category
            </Link>
          </Button>
        )}
      </header>

      {/* New Category Form */}
      {showNewForm && (
        <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Create New Category
          </h2>
          <form action={createCategory} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Race Operations"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="e.g., race-operations"
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  title="Lowercase letters, numbers, and hyphens only"
                  required
                />
                <p className="text-xs text-foreground/50">
                  URL-friendly identifier (lowercase, hyphens)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of what this category is for..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                type="number"
                defaultValue={nextPosition}
                min={0}
              />
              <p className="text-xs text-foreground/50">
                Lower numbers appear first. Use increments of 10 for flexibility.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Category</Button>
              <Button asChild variant="outline">
                <Link href="/forum/admin/categories">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Category Form */}
      {editingCategory && (
        <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Edit Category
          </h2>
          <form action={updateCategory} className="space-y-4">
            <input type="hidden" name="id" value={editingCategory.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingCategory.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={editingCategory.slug}
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  title="Lowercase letters, numbers, and hyphens only"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingCategory.description ?? ''}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                type="number"
                defaultValue={editingCategory.position}
                min={0}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button asChild variant="outline">
                <Link href="/forum/admin/categories">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categoriesWithCounts.map((category) => (
          <div
            key={category.id}
            className={`flex flex-col gap-2 rounded-2xl border bg-card px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
              editingCategory?.id === category.id
                ? 'border-primary/50 bg-primary/5'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-foreground/30">
                <GripVertical className="h-5 w-5" />
                <span className="text-sm font-mono">{category.position}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {category.name}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground/70 font-mono">
                    {category.slug}
                  </span>
                </div>
                {category.description && (
                  <p className="mt-1 text-xs text-foreground/60 line-clamp-1">
                    {category.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-foreground/50 flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {category.threadCount} threads
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/forum/c/${category.slug}`}>View</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/forum/admin/categories?edit=${category.id}`}>
                  <Edit2 className="h-4 w-4" />
                </Link>
              </Button>
              {category.threadCount === 0 && (
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}

        {categoriesWithCounts.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <FolderTree className="h-10 w-10 mx-auto text-foreground/30 mb-3" />
            <p className="text-sm text-foreground/70">No categories yet.</p>
            <Button asChild className="mt-4">
              <Link href="/forum/admin/categories?new=true">
                Create your first category
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
