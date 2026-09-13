import "server-only";
import { createClient } from "@supabase/supabase-js";

// Fully privileged - bypasses every RLS policy. Only ever import this from
// Server Actions/Route Handlers that have already checked getAdminSession()
// (supabase-server.ts) themselves; this client does no auth checking of its
// own. The "server-only" import above makes it a build error to
// accidentally pull this into client-side code.
export function createSupabaseAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
