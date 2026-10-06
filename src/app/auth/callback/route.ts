import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { safeNextPath } from "@/lib/members";

// Where the link in the sign-up (and password-reset) email lands. Supabase
// sends the visitor here with a one-time `code`, which is swapped for a real
// session cookie; then they're sent on to `next` (a path on this site) - or
// to the login page with a note if the link was stale.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/account");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const target = new URL(next, origin);
      if (next === "/account") target.searchParams.set("welcome", "1");
      return NextResponse.redirect(target);
    }
  }

  return NextResponse.redirect(new URL("/login?error=link", origin));
}
