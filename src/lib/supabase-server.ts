import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// For Server Components and Server Actions - reads the session from
// cookies (set by supabase-browser.ts on login, refreshed by proxy.ts on
// every request). Still runs as the anon role; RLS still applies. Use
// supabase-admin.ts instead for anything that needs to bypass RLS
// (reading pending rows, editing any business).
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component that can't set cookies directly -
          // fine as long as proxy.ts is refreshing the session too.
        }
      },
    },
  });
}

/** The current logged-in user's email, or null - and whether it matches
 * ADMIN_EMAIL. Every admin Server Component/Action should check this. */
export async function getAdminSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = !!user?.email && user.email === process.env.ADMIN_EMAIL;
  return { user, isAdmin };
}
