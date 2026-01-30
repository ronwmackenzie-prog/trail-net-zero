import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import { AIChat } from '@/components/admin/ai-chat'

export default async function AdminContentPage() {
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect('/auth/sign-in?redirect=/forum/admin/content')
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_forum_admin')
  if (adminErr || !isAdmin) redirect('/forum')

  return (
    <section className="flex h-[calc(100vh-14rem)] flex-col gap-4">
      <p className="text-xs font-medium text-foreground/60">
        <Link className="hover:text-primary" href="/forum">
          Forum
        </Link>{" "}
        /{" "}
        <Link className="hover:text-primary" href="/forum/admin">
          Admin
        </Link>{" "}
        / AI Content Helper
      </p>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          AI Content Helper
        </h1>
        <p className="text-sm text-foreground/70">
          Generate articles, newsletters, blog posts, and more with AI
          assistance. Toggle web search for up-to-date information.
        </p>
      </header>

      <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <AIChat />
      </div>
    </section>
  );
}
