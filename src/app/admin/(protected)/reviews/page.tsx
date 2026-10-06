import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import ReviewModerationRow from "@/components/admin/ReviewModerationRow";
import { REVIEW_COLUMNS, mapReviewRow, type Review, type ReviewRow } from "@/lib/members";

export const metadata: Metadata = {
  title: "Reviews — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

export default async function AdminReviewsPage() {
  const supabase = createSupabaseAdminClient();

  const [pendingRes, reportsRes, recentRes] = await Promise.all([
    supabase.from("reviews").select(REVIEW_COLUMNS).eq("status", "pending").order("created_at"),
    supabase.from("content_reports").select("target_id, reason").eq("target_type", "review").eq("resolved", false),
    supabase.from("reviews").select(REVIEW_COLUMNS).in("status", ["approved", "declined"]).order("created_at", { ascending: false }).limit(30),
  ]);

  const failure = pendingRes.error || reportsRes.error || recentRes.error;
  if (failure) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        <p style={{ margin: "0 0 6px" }}>Couldn&apos;t load reviews: {failure.message}</p>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
          If this is the first time, run <code>supabase/migrations/0007_members_reviews.sql</code> in the Supabase SQL
          Editor.
        </p>
      </div>
    );
  }

  const pending = ((pendingRes.data ?? []) as ReviewRow[]).map(mapReviewRow);
  const recent = ((recentRes.data ?? []) as ReviewRow[]).map(mapReviewRow);

  // Open reports, grouped by the review they're about.
  const reasonsByReview = new Map<string, string[]>();
  for (const r of reportsRes.data ?? []) {
    const list = reasonsByReview.get(r.target_id as string) ?? [];
    list.push(r.reason as string);
    reasonsByReview.set(r.target_id as string, list);
  }
  const reportedIds = [...reasonsByReview.keys()];
  let reported: Review[] = [];
  if (reportedIds.length > 0) {
    const { data } = await supabase.from("reviews").select(REVIEW_COLUMNS).in("id", reportedIds);
    reported = ((data ?? []) as ReviewRow[]).map(mapReviewRow);
  }

  const businessIds = [...new Set([...pending, ...reported, ...recent].map((r) => r.businessId))];
  const names = new Map<string, string>();
  if (businessIds.length > 0) {
    const { data } = await supabase.from("businesses").select("id, name").in("id", businessIds);
    for (const b of data ?? []) names.set(b.id as string, b.name as string);
  }

  const row = (r: Review) => (
    <ReviewModerationRow
      key={r.id}
      id={r.id}
      businessId={r.businessId}
      businessName={names.get(r.businessId) ?? r.businessId}
      authorName={r.authorName}
      rating={r.rating}
      body={r.body}
      status={r.status}
      createdAt={r.createdAt}
      reports={reasonsByReview.get(r.id) ?? []}
    />
  );

  const shownIds = new Set([...pending, ...reported].map((r) => r.id));

  return (
    <>
      <h1 className="page-title">reviews</h1>
      <p className="page-subtitle">
        New reviews wait here until you approve them. Members can also report a live review — those appear in the second
        list.
      </p>

      <h2 className="section-heading">Waiting for approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="card" style={{ textAlign: "center", opacity: 0.6, marginBottom: 20 }}>
          No new reviews right now.
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>{pending.map(row)}</div>
      )}

      <h2 className="section-heading">Reported ({reported.length})</h2>
      {reported.length === 0 ? (
        <div className="card" style={{ textAlign: "center", opacity: 0.6, marginBottom: 20 }}>
          Nothing has been reported.
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>{reported.map(row)}</div>
      )}

      <h2 className="section-heading">Recently decided</h2>
      <div style={{ marginBottom: 28 }}>{recent.filter((r) => !shownIds.has(r.id)).map(row)}</div>
    </>
  );
}
