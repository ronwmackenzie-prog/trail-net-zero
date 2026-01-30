'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Settings } from "lucide-react";

type Category = { id: string; slug: string; name: string }

function getActive(pathname: string) {
  if (pathname.startsWith('/forum/resources')) return 'resources'
  if (pathname.startsWith('/forum/threads')) return 'threads'
  if (pathname.startsWith("/forum/admin")) return "admin";
  return 'overview'
}

export function ForumSidebarClient({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const active = getActive(pathname)
  const supabase = useMemo(() => createClient(), [])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('forum_categories')
        .select('id, slug, name')
        .order('position', { ascending: true })
      setCategories((data ?? []) as Category[])
    }
    void load()
  }, [supabase])

  const itemClass = (key: string) =>
    `flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
      active === key ? 'bg-primary/10 text-foreground' : 'text-foreground/80 hover:bg-accent'
    }`

  return (
    <aside className="w-full shrink-0 rounded-2xl border border-border bg-card/60 p-5 shadow-sm md:w-72">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/70">
        Forum Navigation
      </h2>

      <nav className="mt-4 space-y-1">
        <Link href="/forum" className={itemClass("overview")}>
          <span>Overview</span>
        </Link>
        <Link href="/forum/threads" className={itemClass("threads")}>
          <span>Threads</span>
        </Link>
        <Link href="/forum/resources" className={itemClass("resources")}>
          <span>Resources</span>
        </Link>
      </nav>

      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
          Categories
        </h3>
        <nav className="mt-3 space-y-1">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/forum/c/${c.slug}`}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-foreground/80 transition hover:bg-accent"
            >
              <span className="truncate">{c.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {isAdmin && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
            Admin
          </h3>
          <nav className="mt-3 space-y-1">
            <Link
              href="/forum/admin"
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                active === "admin"
                  ? "bg-primary/10 text-foreground font-medium"
                  : "text-foreground/80 hover:bg-accent"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </nav>
        </div>
      )}
    </aside>
  );
}

