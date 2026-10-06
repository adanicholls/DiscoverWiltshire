import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import BanMemberButton from "@/components/admin/BanMemberButton";
import { memberHref } from "@/lib/members";

export const metadata: Metadata = {
  title: "Members — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

export default async function AdminMembersPage() {
  const supabase = createSupabaseAdminClient();

  const [profilesRes, reviewsRes, usersRes] = await Promise.all([
    supabase.from("profiles").select("id, display_name, banned, created_at").order("created_at", { ascending: false }),
    supabase.from("reviews").select("user_id"),
    // Emails live in Supabase Auth, not in profiles (profiles are public).
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (profilesRes.error) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        <p style={{ margin: "0 0 6px" }}>Couldn&apos;t load members: {profilesRes.error.message}</p>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
          If this is the first time, run <code>supabase/migrations/0007_members_reviews.sql</code> in the Supabase SQL
          Editor.
        </p>
      </div>
    );
  }

  const emails = new Map((usersRes.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const reviewCounts = new Map<string, number>();
  for (const r of reviewsRes.data ?? []) reviewCounts.set(r.user_id as string, (reviewCounts.get(r.user_id as string) ?? 0) + 1);
  const profiles = profilesRes.data ?? [];

  return (
    <>
      <h1 className="page-title">members</h1>
      <p className="page-subtitle">
        {profiles.length} account{profiles.length === 1 ? "" : "s"}. Banning stops someone posting reviews or reports;
        they can still sign in and read.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {profiles.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                <Link href={memberHref(p.display_name)}>{p.display_name}</Link>
              </div>
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
                {emails.get(p.id) || "—"} · joined {new Date(p.created_at).toLocaleDateString("en-GB")} ·{" "}
                {reviewCounts.get(p.id) ?? 0} review{(reviewCounts.get(p.id) ?? 0) === 1 ? "" : "s"}
              </div>
            </div>
            <BanMemberButton memberId={p.id} name={p.display_name} banned={p.banned} />
          </div>
        ))}
      </div>
    </>
  );
}
