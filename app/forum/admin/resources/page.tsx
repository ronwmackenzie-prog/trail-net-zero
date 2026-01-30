import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import { Button } from '@/components/ui/button'
import { ResourceActions } from "@/components/forum/resource-actions";
import { Archive, FileText, Plus } from "lucide-react";

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const { filter } = await (searchParams as any);
  const { user, hasAccess } = await getForumAccess();
  if (!user) redirect("/auth/sign-in?redirect=/forum/admin/resources");
  if (!hasAccess) redirect("/forum");

  const supabase = await createClient();
  const { data: isAdmin, error: adminErr } =
    await supabase.rpc("is_forum_admin");
  if (adminErr || !isAdmin) redirect("/forum");

  // Fetch all resources, split by archived status
  const { data: allResources } = await supabase
    .from("member_resources")
    .select(
      "id, slug, title, kind, is_published, is_archived, published_at, archived_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const activeResources = (allResources ?? []).filter((r) => !r.is_archived);
  const archivedResources = (allResources ?? []).filter((r) => r.is_archived);

  const showArchived = filter === "archived";
  const displayResources = showArchived ? archivedResources : activeResources;

  return (
    <section className="flex flex-col gap-6">
      <p className="text-xs font-medium text-foreground/60">
        <Link className="hover:text-primary" href="/forum">
          Forum
        </Link>{" "}
        /{" "}
        <Link className="hover:text-primary" href="/forum/admin">
          Admin
        </Link>{" "}
        / Resources
      </p>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Manage resources
          </h1>
          <p className="text-sm text-foreground/70">
            Create member-only articles and links as a membership perk.
          </p>
        </div>
        <Button asChild>
          <Link href="/forum/admin/resources/new" className="gap-2">
            <Plus className="h-4 w-4" />
            New resource
          </Link>
        </Button>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Link
          href="/forum/admin/resources"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !showArchived
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          Active ({activeResources.length})
        </Link>
        <Link
          href="/forum/admin/resources?filter=archived"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showArchived
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-foreground"
          }`}
        >
          <Archive className="h-4 w-4" />
          Archived ({archivedResources.length})
        </Link>
      </div>

      <div className="space-y-3">
        {displayResources.map((r) => (
          <div
            key={r.id}
            className={`flex flex-col gap-2 rounded-2xl border bg-card px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
              r.is_archived ? "border-border/50 opacity-75" : "border-border"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground truncate">
                  {r.title}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground/70">
                  {r.kind}
                </span>
                {r.is_archived && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Archived
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-foreground/60">
                {r.is_published ? (
                  <span className="text-green-600 dark:text-green-400">
                    Published
                  </span>
                ) : (
                  <span className="text-foreground/50">Draft</span>
                )}{" "}
                ·{" "}
                {new Date(
                  (r.published_at ?? r.created_at) as string,
                ).toLocaleDateString()}
                {r.is_archived && r.archived_at && (
                  <>
                    {" "}
                    · Archived {new Date(r.archived_at).toLocaleDateString()}
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-foreground/50 font-mono">
                {r.slug}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!r.is_archived && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/forum/resources/${r.slug}`}>View</Link>
                </Button>
              )}
              <Button asChild size="sm" variant="outline">
                <Link href={`/forum/admin/resources/edit/${r.id}`}>Edit</Link>
              </Button>
              <ResourceActions
                resourceId={r.id}
                resourceTitle={r.title}
                isArchived={r.is_archived ?? false}
              />
            </div>
          </div>
        ))}

        {displayResources.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            {showArchived ? (
              <>
                <Archive className="h-10 w-10 mx-auto text-foreground/30 mb-3" />
                <p className="text-sm text-foreground/70">
                  No archived resources.
                </p>
                <p className="text-xs text-foreground/50 mt-1">
                  Archived resources will appear here.
                </p>
              </>
            ) : (
              <>
                <FileText className="h-10 w-10 mx-auto text-foreground/30 mb-3" />
                <p className="text-sm text-foreground/70">No resources yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/forum/admin/resources/new">
                    Create your first resource
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

