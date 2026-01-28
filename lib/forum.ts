import { createClient } from '@/lib/supabase/server'

export async function getForumAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, hasAccess: false }

  const { data, error } = await supabase.rpc('has_forum_access')
  if (error) {
    // Fail closed: if RPC fails, treat as no access
    return { user, hasAccess: false }
  }

  return { user, hasAccess: !!data }
}

