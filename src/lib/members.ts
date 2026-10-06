// Shared rules for members and reviews. These mirror the database's own
// check constraints (supabase/migrations/0007_members_reviews.sql), so the
// forms can give a friendly message before the database would reject a value.

export const DISPLAY_NAME_MIN = 3;
export const DISPLAY_NAME_MAX = 30;
export const PASSWORD_MIN = 8;
export const BIO_MAX = 300;
export const REVIEW_MIN = 10;
export const REVIEW_MAX = 2000;
export const REPORT_REASON_MIN = 3;
export const REPORT_REASON_MAX = 500;

export function validateDisplayName(name: string): string | null {
  const v = name.trim();
  if (v.length < DISPLAY_NAME_MIN || v.length > DISPLAY_NAME_MAX) {
    return `Your name needs to be ${DISPLAY_NAME_MIN}–${DISPLAY_NAME_MAX} characters.`;
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9 _.-]*$/.test(v)) {
    return "Use letters, numbers, spaces, dots, dashes or underscores, starting with a letter or number.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  return password.length >= PASSWORD_MIN ? null : `Your password needs to be at least ${PASSWORD_MIN} characters.`;
}

export function validateReview(rating: number, body: string): string | null {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return "Pick a rating from 1 to 5 stars.";
  const len = body.trim().length;
  if (len < REVIEW_MIN) return `Tell people a little more — at least ${REVIEW_MIN} characters.`;
  if (len > REVIEW_MAX) return `Please keep your review under ${REVIEW_MAX} characters.`;
  return null;
}

/** Only ever send people to a path on this site after signing in - never to
 * an address that arrived in a query string ("//evil.com", "https://..."). */
export function safeNextPath(next: string | null | undefined, fallback = "/account"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}

/** Address of a member's public profile. */
export function memberHref(displayName: string): string {
  return `/members/${encodeURIComponent(displayName)}`;
}

export type ReviewStatus = "pending" | "approved" | "declined";

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  authorName: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface ReviewRow {
  id: string;
  business_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  created_at: string;
}

export const REVIEW_COLUMNS = "id, business_id, user_id, author_name, rating, body, status, created_at";

export function mapReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    businessId: row.business_id,
    userId: row.user_id,
    authorName: row.author_name,
    rating: row.rating,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
  };
}

export interface ReviewStats {
  reviewCount: number;
  avgRating: number;
}

/** "3 March 2026" - reviews are dated by day, in UK time. */
export function formatReviewDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }).format(
    new Date(iso)
  );
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?"
  );
}
