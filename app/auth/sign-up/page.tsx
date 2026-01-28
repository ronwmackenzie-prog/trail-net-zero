'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type PasswordRequirements = {
  length: boolean
  upper: boolean
  lower: boolean
  number: boolean
  special: boolean
}

function evaluatePassword(value: string): PasswordRequirements {
  return {
    length: value.length >= 10,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  }
}

export default function SignUpPage() {
  const router = useRouter()
  const [redirectTo, setRedirectTo] = useState('/forum')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmFocused, setConfirmFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    setRedirectTo(redirect || '/forum')
  }, [])

  const passwordChecks = useMemo(() => evaluatePassword(password), [password])
  const confirmChecks = useMemo(() => evaluatePassword(confirmPassword), [confirmPassword])
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password

  const allPasswordRequirementsMet =
    passwordChecks.length &&
    passwordChecks.upper &&
    passwordChecks.lower &&
    passwordChecks.number &&
    passwordChecks.special

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!allPasswordRequirementsMet) {
      setError('Please satisfy all password requirements before continuing.')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords must match.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // For email/password, Supabase may require email confirmation depending on project settings.
      // Redirect to sign-in with a hint.
      router.push(`/auth/sign-in?registered=1&redirect=${encodeURIComponent(redirectTo)}`)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const renderRequirements = (
    checks: PasswordRequirements,
    show: boolean,
    includeMatch?: boolean,
  ) => {
    if (!show) return null

    const baseClasses = 'text-xs'
    const unmet = 'text-foreground/60'
    const met = 'text-emerald-500'

    return (
      <div className="space-y-1 pt-1">
        <p className={`${baseClasses} ${checks.length ? met : unmet}`}>
          • At least 10 characters
        </p>
        <p className={`${baseClasses} ${checks.upper ? met : unmet}`}>• One uppercase letter</p>
        <p className={`${baseClasses} ${checks.lower ? met : unmet}`}>• One lowercase letter</p>
        <p className={`${baseClasses} ${checks.number ? met : unmet}`}>• One number</p>
        <p className={`${baseClasses} ${checks.special ? met : unmet}`}>• One special character</p>
        {includeMatch && (
          <p className={`${baseClasses} ${passwordsMatch ? met : unmet}`}>• Passwords match</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mb-6 text-center text-sm text-foreground/70">
          Use your work email to join the Trail Net Zero community.
        </p>

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

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-foreground/60 hover:text-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {renderRequirements(passwordChecks, passwordFocused)}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-foreground/60 hover:text-foreground"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {renderRequirements(
              confirmChecks,
              confirmFocused,
              true,
            )}
          </div>

          {error && (
            <p className="pt-1 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-2 w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/70">
          Already have an account?{' '}
          <button
            type="button"
            className="font-medium text-primary underline-offset-2 hover:underline"
            onClick={() => router.push(`/auth/sign-in?redirect=${encodeURIComponent(redirectTo)}`)}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

