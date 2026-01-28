import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  if (!url || !anonKey) {
    // If Supabase isn't fully configured, don't block access.
    return response
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options as CookieOptions),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isForumPath = request.nextUrl.pathname.startsWith('/forum')

  if (!isForumPath) {
    return response
  }

  // Require authentication for the forum, but allow both trial and subscribed
  if (!user) {
    const redirectUrl = new URL('/auth/sign-in', request.url)
    redirectUrl.searchParams.set('redirect', '/forum')
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/forum/:path*'],
}

