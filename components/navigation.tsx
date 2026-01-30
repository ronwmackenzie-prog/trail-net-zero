"use client"

import Link from "next/link"
import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/actions";

interface NavigationProps {
  initialIsSignedIn?: boolean;
}

export function Navigation({ initialIsSignedIn }: NavigationProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(initialIsSignedIn ?? false);
  const [isLoading, setIsLoading] = useState(initialIsSignedIn === undefined);
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  // Check auth state on mount if not provided
  useEffect(() => {
    if (initialIsSignedIn !== undefined) {
      setIsSignedIn(initialIsSignedIn);
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsSignedIn(!!user);
      setIsLoading(false);
    };
    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [initialIsSignedIn, supabase.auth]);

  const getNavItemClass = (path: string) => {
    const isActive =
      path === "/forum" ? pathname === "/forum" : pathname.startsWith(path);
    return `text-sm font-medium transition-colors ${
      isActive ? "text-foreground" : "text-foreground/70 hover:text-foreground"
    }`;
  };

  // Close menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              TN
            </span>
          </div>
          <span className="text-lg font-semibold text-foreground">
            Trail Net Zero
          </span>
        </Link>

        {/* Desktop Navigation */}
        {isLoading ? (
          <nav className="hidden items-center gap-6 md:flex">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </nav>
        ) : isSignedIn ? (
          // Signed-in navigation
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/forum" className={getNavItemClass("/forum")}>
              Overview
            </Link>
            <Link
              href="/forum/threads"
              className={getNavItemClass("/forum/threads")}
            >
              Threads
            </Link>
            <Link
              href="/forum/resources"
              className={getNavItemClass("/forum/resources")}
            >
              Resources
            </Link>
            <Link href="/account" className={getNavItemClass("/account")}>
              Account
            </Link>
          </nav>
        ) : (
          // Signed-out navigation
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className={getNavItemClass("/")}>
              Home
            </Link>
            <Link href="/about" className={getNavItemClass("/about")}>
              About
            </Link>
            <Link href="/forum" className={getNavItemClass("/forum")}>
              Forum
            </Link>
            <Link href="/contact" className={getNavItemClass("/contact")}>
              Contact
            </Link>
            <Link
              href="/auth/sign-in"
              className={getNavItemClass("/auth/sign-in")}
            >
              Sign in
            </Link>
          </nav>
        )}

        {/* Desktop Action Button */}
        <div className="hidden md:block">
          {isLoading ? (
            <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
          ) : isSignedIn ? (
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </form>
          ) : (
            <Button asChild>
              <Link href="/join">Start free trial</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-4 p-4">
            {isSignedIn ? (
              // Signed-in mobile navigation
              <>
                <Link
                  href="/"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Home
                </Link>
                <Link
                  href="/forum"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Overview
                </Link>
                <Link
                  href="/forum/threads"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Threads
                </Link>
                <Link
                  href="/forum/resources"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Resources
                </Link>
                <Link
                  href="/account"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Account
                </Link>
                <form action={signOut} className="mt-2">
                  <Button type="submit" variant="outline" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              // Signed-out mobile navigation
              <>
                <Link
                  href="/"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  About
                </Link>
                <Link
                  href="/forum"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forum
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
                <Button asChild className="mt-2 w-full">
                  <Link href="/join">Start free trial</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
