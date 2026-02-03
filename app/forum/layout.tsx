import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { createClient } from "@/lib/supabase/server";
import { getForumAccess } from "@/lib/forum";
import { ForumSidebarClient } from "@/components/forum/forum-sidebar-client";
import { WelcomeModal } from "@/components/forum/welcome-modal";

export default async function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hasAccess } = await getForumAccess();

  // If they don't have access, we still render children (upgrade screens), but hide sidebar.
  let isAdmin = false;
  let showWelcome = false;

  if (user && hasAccess) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("is_forum_admin");
    isAdmin = !!data;

    // Check if user has seen the welcome modal
    const { data: profile } = await supabase
      .from("profiles")
      .select("welcome_seen_at")
      .eq("id", user.id)
      .single();

    showWelcome = !profile?.welcome_seen_at;
  }

  return (
    <div className="min-h-screen">
      <Navigation initialIsSignedIn={!!user} />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:gap-10 md:px-6">
        {user && hasAccess ? <ForumSidebarClient isAdmin={isAdmin} /> : null}
        <section className="flex-1">{children}</section>
      </main>
      <Footer />
      {user && hasAccess && showWelcome && <WelcomeModal showWelcome={showWelcome} />}
    </div>
  );
}
