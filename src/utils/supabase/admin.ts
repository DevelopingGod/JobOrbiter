import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service-role client — bypasses Row Level Security and can perform admin
// operations (e.g. auth.admin.deleteUser). Never import this into
// request-scoped/user-facing code paths that don't specifically need admin
// privileges; use utils/supabase/server.ts for normal authenticated access.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Required for admin operations like rolling back a failed signup.'
    )
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
