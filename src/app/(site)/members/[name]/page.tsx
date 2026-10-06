import type { Metadata } from "next";
import Link from "next/link";
import Stars from "@/components/members/Stars";
import { supabase } from "@/lib/supabase";
import { REVIEW_COLUMNS, formatReviewDate, initials, mapReviewRow, type ReviewRow } from "@/lib/members";
import "@/components/members/members.css";

interface Profile {
  id: string;
  display_name: string;
  bio: string;
  created_at: string;
}

async function findProfile(name: string): Promise<Profile | null> {
  const escaped = name.replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, bio, created_at")
    .ilike("display_name", escaped)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("Failed to load profile:", error);
    return null;
  }
  return (data as Profile | null) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/members/[name]">): Promise<Metadata> {
  const { name } = await params;
  const profile = await findProfile(decodeURIComponent(name));
  return {
    title: profile ? `${profile.display_name} — Discover Wiltshire` : "Member — Discover Wiltshire",
    robots: { index: false, follow: true },
  };
}

export default async function MemberPage({ params }: PageProps<"/members/[name]">) {
  const { name } = await params;
  const profile = await findProfile(decodeURIComponent(name));

  if (!profile) {
    return (
      <div className="wrap" style={{ maxWidth: 720 }}>
        <h1 className="page-title">Member not found</h1>
        <p className="page-subtitle">
          We couldn&apos;t find that member. <Link href="/">Back to the rankings</Link>.
        </p>
      </div>
    );
  }

  // Row-level security means this only ever returns approved reviews.
  const { data: reviewRows } = await supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .eq("user_id", profile.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  const reviews = ((reviewRows ?? []) as ReviewRow[]).map(mapReviewRow);

  const businessNames = new Map<string, string>();
  const ids = [...new Set(reviews.map((r) => r.businessId))];
  if (ids.length > 0) {
    const { data: businesses } = await supabase.from("businesses").select("id, name").in("id", ids);
    for (const b of businesses ?? []) businessNames.set(b.id as string, b.name as string);
  }

  const joined = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "Europe/London" }).format(
    new Date(profile.created_at)
  );

  return (
    <div className="wrap" style={{ maxWidth: 720 }}>
      <div className="member-head">
        <span className="member-avatar" aria-hidden="true">
          {initials(profile.display_name)}
        </span>
        <div>
          <h1 className="member-name">{profile.display_name}</h1>
          <p className="member-meta">
            Member since {joined} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      {profile.bio && <p className="member-bio">{profile.bio}</p>}

      <section className="member-section" aria-labelledby="member-reviews">
        <h2 id="member-reviews">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="auth-note">No published reviews yet.</p>
        ) : (
          <div className="member-reviews">
            {reviews.map((r) => (
              <article className="member-review" key={r.id}>
                <div className="member-review-top">
                  <Link className="member-review-biz" href={`/business/${r.businessId}`}>
                    {businessNames.get(r.businessId) ?? r.businessId}
                  </Link>
                  <Stars rating={r.rating} size={14} />
                  <time className="member-review-date" dateTime={r.createdAt}>
                    {formatReviewDate(r.createdAt)}
                  </time>
                </div>
                <p>{r.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
