import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getForumAccess } from "@/lib/forum";
import { ForumSidebarClient } from "@/components/forum/forum-sidebar-client";

export default async function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hasAccess } = await getForumAccess();
  if (!user) redirect("/auth/sign-in?redirect=/forum");

  // If they don’t have access, we still render children (upgrade screens), but hide sidebar.
  let isAdmin = false;
  if (hasAccess) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("is_forum_admin");
    isAdmin = !!data;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:gap-10 md:px-6">
        {hasAccess ? <ForumSidebarClient isAdmin={isAdmin} /> : null}
        <section className="flex-1">{children}</section>
      </main>
      <Footer />
    </div>
  );
}

