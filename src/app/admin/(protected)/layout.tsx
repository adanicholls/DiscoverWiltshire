import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/supabase-server";
import SignOutButton from "@/components/admin/SignOutButton";

// proxy.ts already redirects unauthenticated/wrong-account requests away
// from /admin, but this checks again here (a Data Access Layer style
// check, per Next.js's own auth guidance) rather than relying on proxy
// alone - defense in depth, and this is what actually protects the page
// if proxy's matcher config is ever changed or bypassed.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { isAdmin, user } = await getAdminSession();
  if (!isAdmin) redirect("/admin/login");

  return (
    <>
      <header className="site-header">
        <div className="wrap nav-bar">
          <Link className="logo" href="/admin">
            Discover Wiltshire — admin
          </Link>
          <nav className="nav-links">
            <Link className="nav-item" href="/admin">
              Queue
            </Link>
            <Link className="nav-item" href="/admin/businesses">
              Businesses
            </Link>
            <Link className="nav-item" href="/admin/categories">
              Categories
            </Link>
          </nav>
          <div className="nav-utility">
            <span className="sign-in" style={{ opacity: 0.6 }}>{user?.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="wrap">{children}</main>
    </>
  );
}
