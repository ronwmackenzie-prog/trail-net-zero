import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-sm font-bold text-primary-foreground">TN</span>
              </div>
              <span className="text-lg font-semibold text-foreground">Trail Net Zero</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/70">
              A professional community for trail running sustainability practitioners. 
              Evidence-based decisions. Transparent collaboration. Real-world outcomes.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Navigation</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Forum
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Community</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/#join" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Join Slack
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#who" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                  Who It{"'"}s For
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-foreground/70">
            Trail Net Zero. Evidence over marketing. Action over claims.
          </p>
          <div className="flex gap-6">
            <Link href="/contact" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
