import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import {
  FileText,
  FolderTree,
  MessageSquare,
  Flag,
  Sparkles,
  Settings,
  ChevronRight,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect('/auth/sign-in?redirect=/forum/admin')
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_forum_admin')
  if (adminErr || !isAdmin) redirect('/forum')

  // Get counts for dashboard cards
  const [
    { count: resourceCount },
    { count: categoryCount },
    { count: threadCount },
    { count: flagCount },
  ] = await Promise.all([
    supabase
      .from('member_resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', false),
    supabase.from('forum_categories').select('*', { count: 'exact', head: true }),
    supabase
      .from('forum_threads')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .eq('is_archived', false),
    supabase.from('forum_post_flags').select('*', { count: 'exact', head: true }),
  ])

  const adminCards = [
    {
      title: 'Resources',
      description: 'Create and manage member-only articles and links.',
      href: '/forum/admin/resources',
      icon: FileText,
      count: resourceCount ?? 0,
      countLabel: 'active resources',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Categories',
      description: 'Manage forum categories for organizing discussions.',
      href: '/forum/admin/categories',
      icon: FolderTree,
      count: categoryCount ?? 0,
      countLabel: 'categories',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Threads',
      description: 'Moderate, archive, and manage forum discussions.',
      href: '/forum/admin/threads',
      icon: MessageSquare,
      count: threadCount ?? 0,
      countLabel: 'active threads',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Reported Posts',
      description: 'Review and act on flagged content from the community.',
      href: '/forum/admin/flags',
      icon: Flag,
      count: flagCount ?? 0,
      countLabel: 'reports',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'AI Content Helper',
      description: 'Generate content ideas and drafts with AI assistance.',
      href: '/forum/admin/content',
      icon: Sparkles,
      count: null,
      countLabel: null,
      color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    },
  ]

  return (
    <section className="flex flex-col gap-6">
      <p className="text-xs font-medium text-foreground/60">
        <Link className="hover:text-primary" href="/forum">
          Forum
        </Link>{' '}
        / Admin
      </p>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-foreground/70">
          Manage your forum, resources, and community from one place.
        </p>
      </header>

      {/* Admin Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-3 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <ChevronRight className="h-5 w-5 text-foreground/30 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">{card.title}</h2>
              <p className="mt-1 text-sm text-foreground/60">{card.description}</p>
            </div>
            {card.count !== null && (
              <div className="border-t border-border pt-3">
                <p className="text-2xl font-bold text-foreground">{card.count}</p>
                <p className="text-xs text-foreground/50">{card.countLabel}</p>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-foreground/50" />
          <h3 className="text-sm font-semibold text-foreground">Quick Overview</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-2xl font-bold text-foreground">{resourceCount ?? 0}</p>
            <p className="text-xs text-foreground/60">Total Resources</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-2xl font-bold text-foreground">{categoryCount ?? 0}</p>
            <p className="text-xs text-foreground/60">Categories</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-2xl font-bold text-foreground">{threadCount ?? 0}</p>
            <p className="text-xs text-foreground/60">Active Threads</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-2xl font-bold text-foreground">{flagCount ?? 0}</p>
            <p className="text-xs text-foreground/60">Pending Reports</p>
          </div>
        </div>
      </div>
    </section>
  )
}
