import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import {
  FileText,
  Link as LinkIcon,
  Bell,
  Newspaper,
  BookOpen,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default async function ResourceDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = await (params as any)
  const { user, hasAccess } = await getForumAccess()
  if (!user) redirect(`/auth/sign-in?redirect=/forum/resources/${encodeURIComponent(slug)}`)
  if (!hasAccess) redirect('/forum')

  const supabase = await createClient()
  const { data: isAdmin } = await supabase.rpc("is_forum_admin");

  const { data: resource } = await supabase
    .from("member_resources")
    .select(
      "id, slug, title, excerpt, body, cover_image, external_url, kind, published_at, created_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!resource) notFound()

  const Icon = KIND_ICONS[resource.kind] ?? FileText;
  const kindLabel = KIND_LABELS[resource.kind] ?? resource.kind;

  return (
    <section className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Breadcrumb & Admin Link */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium text-foreground/60">
          <Link className="hover:text-primary" href="/forum/resources">
            Resources
          </Link>{" "}
          / {resource.title}
        </p>
        {isAdmin && (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/forum/admin/resources/edit/${resource.id}`}>
              Edit resource
            </Link>
          </Button>
        )}
      </div>

      {/* Cover Image */}
      {resource.cover_image && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
          <img
            src={resource.cover_image}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <Icon className="h-4 w-4" />
          <span>{kindLabel}</span>
          <span>·</span>
          <time dateTime={resource.published_at ?? resource.created_at ?? ""}>
            {new Date(
              (resource.published_at ?? resource.created_at) as string,
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          {resource.title}
        </h1>
        {resource.excerpt && (
          <p className="text-lg text-foreground/70 leading-relaxed">
            {resource.excerpt}
          </p>
        )}
      </header>

      {/* External URL Card */}
      {resource.external_url && (
        <a
          href={resource.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md group"
        >
          <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10">
            <ExternalLink className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              View external resource
            </p>
            <p className="text-sm text-foreground/60 truncate">
              {resource.external_url}
            </p>
          </div>
        </a>
      )}

      {/* Body Content */}
      {resource.body ? (
        <article
          className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: resource.body }}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-foreground/70">
          No content yet.
        </div>
      )}

      {/* Back Link */}
      <div className="pt-6 border-t border-border">
        <Button asChild variant="ghost">
          <Link href="/forum/resources" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>
        </Button>
      </div>
    </section>
  );
}

