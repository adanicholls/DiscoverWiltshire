"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { submitReview } from "@/app/member-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { REVIEW_MAX, validateReview } from "@/lib/members";

type Auth = "checking" | "out" | "in";

/** The "Write a review" button and its form. Signed-out visitors are sent to
 * sign in (and brought straight back here); signed-in members pick a star
 * rating and write a few lines. Reviews are held for approval, and the form
 * says so - they won't appear on the page straight away. */
export default function ReviewComposer({ businessId, businessName }: { businessId: string; businessName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState<Auth>("checking");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open || auth !== "checking") return;
    createSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => setAuth(data.user ? "in" : "out"));
  }, [open, auth]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validateReview(rating, body);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await submitReview(businessId, rating, body);
    setSubmitting(false);
    if (!result.ok) {
      if (result.error === "Please sign in first.") setAuth("out");
      setError(result.error ?? "Couldn't save your review.");
      return;
    }
    setSent(true);
    router.refresh();
  }

  const shown = hover || rating;
  const nextHref = `/login?next=${encodeURIComponent(`/business/${businessId}`)}`;

  if (!open) {
    return (
      <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
        Write a review
      </button>
    );
  }

  if (sent) {
    return (
      <div className="review-note" role="status">
        <strong>Thank you!</strong> Your review of {businessName} has been sent. It will appear once it&apos;s been
        approved — usually within a couple of days.
      </div>
    );
  }

  if (auth === "checking") return <p className="review-hint">One moment…</p>;

  if (auth === "out") {
    return (
      <div className="review-note">
        <Link href={nextHref}>Sign in</Link> or <Link href={`/signup?next=${encodeURIComponent(`/business/${businessId}`)}`}>create a free account</Link>{" "}
        to review {businessName}.
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3 className="review-form-title">Review {businessName}</h3>

      <fieldset className="review-rating">
        <legend>Your rating</legend>
        <div onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={"review-star" + (n <= shown ? " on" : "")}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor={`review-body-${businessId}`}>Your review</label>
        <textarea
          id={`review-body-${businessId}`}
          rows={5}
          value={body}
          maxLength={REVIEW_MAX}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What was it like? Be honest and specific — it helps other people most."
        />
        <div className="hint">
          Write about your own experience, and keep it civil. Reviews are checked before they&apos;re published.
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="review-form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Sending…" : "Submit review"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
