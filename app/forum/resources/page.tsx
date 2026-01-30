import Link from 'next/link'
import Image from "next/image";
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Link as LinkIcon,
  Bell,
  Newspaper,
  BookOpen,
} from "lucide-react";

const KIND_ICONS: Record<string, typeof FileText> = {
  article: FileText,
  link: LinkIcon,
  update: Bell,
  newsletter: Newspaper,
  guide: BookOpen,
};

const KIND_LABELS: Record<string, string> = {
  article: "Article",
  link: "External Link",
  update: "Update",
  newsletter: "Newsletter",
  guide: "Guide",
};

export default async function ResourcesPage() {
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect('/auth/sign-in?redirect=/forum/resources')
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()
  const { data: isAdmin } = await supabase.rpc('is_forum_admin')

  const { data: resources } = await supabase
    .from("member_resources")
    .select(
      "id, slug, title, excerpt, cover_image, kind, published_at, created_at",
    )
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Resources</h1>
          <p className="max-w-2xl text-sm text-foreground/70">
            Member-only articles, templates, and reference material curated by
            the admins.
          </p>
        </div>
        {isAdmin ? (
          <Button asChild variant="outline">
            <Link href="/forum/admin/resources">Admin: manage resources</Link>
          </Button>
        ) : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(resources ?? []).map((r) => {
          const Icon = KIND_ICONS[r.kind] ?? FileText;
          const kindLabel = KIND_LABELS[r.kind] ?? r.kind;

          return (
            <Link
              key={r.id}
              href={`/forum/resources/${r.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md overflow-hidden"
            >
              {/* Cover Image */}
              {r.cover_image ? (
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={r.cover_image}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Icon className="h-12 w-12 text-foreground/20" />
                </div>
              )}

              {/* Content */}
              <div className="flex flex-col flex-1 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/60">
                    <Icon className="h-3.5 w-3.5" />
                    {kindLabel}
                  </div>
                  <p className="text-xs text-foreground/60">
                    {new Date(
                      (r.published_at ?? r.created_at) as string,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {r.title}
                </h2>
                {r.excerpt ? (
                  <p className="mt-2 text-sm text-foreground/70 line-clamp-2">
                    {r.excerpt}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      {(resources ?? []).length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-foreground/70">
          No resources yet.
        </div>
      )}
    </section>
  );
}

