import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// "proxy.ts" is this Next.js version's renamed "middleware.ts" - same
// mechanism, runs on every matched request before rendering.
//
// Two jobs: keep the Supabase auth cookie fresh (standard @supabase/ssr
// pattern), and gate everything under /admin (other than the login page
// itself) behind a real, logged-in session belonging to ADMIN_EMAIL.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdmin = !!user?.email && user.email === process.env.ADMIN_EMAIL;

  if (isAdminRoute && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    // Distinguishes "please log in" from "that account isn't the admin
    // one" - the login page uses this to show a clearer message instead
    // of silently bouncing a signed-in user back to where they started.
    if (user) url.searchParams.set("unauthorized", "1");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
