"use client";

import { createBrowserClient } from "@supabase/ssr";

// Distinct from lib/supabase.ts (the plain client the public site uses for
// reads/votes/listings). This one stores the session in cookies rather
// than localStorage, so server-rendered admin pages and proxy.ts can see
// it - required for real login to work with Server Components.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
