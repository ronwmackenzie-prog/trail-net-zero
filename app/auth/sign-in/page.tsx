'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const router = useRouter()
  const [redirectTo, setRedirectTo] = useState('/forum')
  const [registered, setRegistered] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    const wasRegistered = params.get('registered') === '1'
    setRedirectTo(redirect || '/forum')
    setRegistered(wasRegistered)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      router.push(redirectTo)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-foreground">Sign in</h1>
        <p className="mb-6 text-center text-sm text-foreground/70">
          Access the Trail Net Zero member forum and resources.
        </p>

        {registered && (
          <p className="mb-4 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground/80">
            Your account was created. Please check your email and confirm your address before signing in.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/70">
          Don&apos;t have an account yet?{' '}
          <button
            type="button"
            className="font-medium text-primary underline-offset-2 hover:underline"
            onClick={() => router.push(`/auth/sign-up?redirect=${encodeURIComponent(redirectTo)}`)}
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  )
}

