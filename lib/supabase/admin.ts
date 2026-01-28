import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  // We intentionally don't throw here because this module may be imported
  // in environments (like local dev) before secrets are configured.
  console.warn('Supabase admin client is not fully configured')
}

export const supabaseAdmin =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

