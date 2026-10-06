import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import BioForm from "@/components/members/BioForm";
import DeleteReviewButton from "@/components/members/DeleteReviewButton";
import MemberSignOut from "@/components/members/MemberSignOut";
import Stars from "@/components/members/Stars";
import { getMemberSession } from "@/lib/supabase-server";
import { REVIEW_COLUMNS, formatReviewDate, initials, mapReviewRow, memberHref, type ReviewRow } from "@/lib/members";
import "@/components/members/members.css";

export const metadata: Metadata = {
  title: "Your account — Discover Wiltshire",
  robots: { index: false, follow: false },
};

const STATUS_TEXT = {
  pending: "Awaiting approval",
  approved: "Live",
  declined: "Not published",
} as const;

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const params = await searchParams;
  const { supabase, user } = await getMemberSession();
  if (!user) redirect("/login?next=/account");

  // A missing profile (e.g. the members migration hasn't been run yet) just
  // falls back to what sign-up stored, rather than breaking the page.
  const [{ data: profile }, { data: reviewRows }] = await Promise.all([
    supabase.from("profiles").select("display_name, bio, created_at").eq("id", user.id).maybeSingle(),
    supabase.from("reviews").select(REVIEW_COLUMNS).eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const displayName =
    profile?.display_name || (user.user_metadata?.display_name as string | undefined) || user.email?.split("@")[0] || "Member";
  const reviews = ((reviewRows ?? []) as ReviewRow[]).map(mapReviewRow);

  const businessIds = [...new Set(reviews.map((r) => r.businessId))];
  const businessNames = new Map<string, string>();
  if (businessIds.length > 0) {
    const { data: businesses } = await supabase.from("businesses").select("id, name").in("id", businessIds);
    for (const b of businesses ?? []) businessNames.set(b.id as string, b.name as string);
  }

  return (
    <div className="wrap" style={{ maxWidth: 720 }}>
      {params.welcome === "1" && (
        <p className="welcome-banner">Welcome to Discover Wiltshire — your email is confirmed and you&apos;re signed in.</p>
      )}

      <div className="member-head">
        <span className="member-avatar" aria-hidden="true">
          {initials(displayName)}
        </span>
        <div>
          <h1 className="member-name">{displayName}</h1>
          <p className="member-meta">
            {user.email}
            {profile && (
              <>
                {" · "}
                <Link href={memberHref(displayName)} style={{ textDecoration: "underline" }}>
                  View public profile
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {profile ? (
        <div className="member-section">
          <BioForm initialBio={profile.bio ?? ""} />
        </div>
      ) : (
        <p className="auth-note" style={{ marginTop: 20 }}>
          Your profile isn&apos;t set up yet, so you can&apos;t write reviews. This usually sorts itself out — try signing
          out and back in, and let us know if it doesn&apos;t.
        </p>
      )}

      <section className="member-section" aria-labelledby="my-reviews">
        <h2 id="my-reviews">Your reviews</h2>
        {reviews.length === 0 ? (
          <p className="auth-note">
            You haven&apos;t reviewed anywhere yet. Find a place you know on the <Link href="/" style={{ textDecoration: "underline" }}>rankings</Link> and
            tell people what it&apos;s like.
          </p>
        ) : (
          <div className="member-reviews">
            {reviews.map((r) => (
              <article className="member-review" key={r.id}>
                <div className="member-review-top">
                  <Link className="member-review-biz" href={`/business/${r.businessId}`}>
                    {businessNames.get(r.businessId) ?? r.businessId}
                  </Link>
                  <Stars rating={r.rating} size={14} />
                  <span className={`status-pill status-${r.status}`}>{STATUS_TEXT[r.status]}</span>
                  <time className="member-review-date" dateTime={r.createdAt}>
                    {formatReviewDate(r.createdAt)}
                  </time>
                </div>
                <p>{r.body}</p>
                <div className="member-review-foot">
                  <DeleteReviewButton reviewId={r.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="member-section">
        <MemberSignOut />
      </div>
    </div>
  );
}
