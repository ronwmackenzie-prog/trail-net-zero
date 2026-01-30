import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getForumAccess } from '@/lib/forum'
import { ResourceEditor } from '@/components/forum/resource-editor'
import { NewResourceWrapper } from "@/components/forum/new-resource-wrapper";

export default async function NewResourcePage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const { from } = await (searchParams as any);
  const { user, hasAccess } = await getForumAccess();
  if (!user) redirect("/auth/sign-in?redirect=/forum/admin/resources/new");
  if (!hasAccess) redirect("/forum");

  const supabase = await createClient();
  const { data: isAdmin, error: adminErr } =
    await supabase.rpc("is_forum_admin");
  if (adminErr || !isAdmin) redirect("/forum");

  const fromAI = from === "ai";

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
        /{" "}
        <Link className="hover:text-primary" href="/forum/admin/resources">
          Resources
        </Link>{" "}
        / New
      </p>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">New resource</h1>
        <p className="text-sm text-foreground/70">
          {fromAI
            ? "AI-generated content has been loaded into the editor. Add a title and make any edits before publishing."
            : "Create an article/link for members."}
        </p>
      </header>
      <NewResourceWrapper fromAI={fromAI} />
    </section>
  );
}

