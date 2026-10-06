"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { reportReview } from "@/app/member-actions";
import { REPORT_REASON_MAX } from "@/lib/members";

/** A small "Report" link under a review that opens a one-line form. The
 * report goes to the admin queue; nothing is hidden from the page until a
 * person has looked at it. */
export default function ReportReviewButton({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "signin">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const result = await reportReview(reviewId, reason);
    if (result.ok) {
      setState("done");
      return;
    }
    if (result.error === "Please sign in first.") {
      setState("signin");
      return;
    }
    setError(result.error ?? "Couldn't send your report.");
    setState("idle");
  }

  if (state === "done") return <span className="report-note">Thanks — we&apos;ll take a look.</span>;
  if (state === "signin") {
    return (
      <span className="report-note">
        <Link href="/login">Sign in</Link> to report a review.
      </span>
    );
  }

  if (!open) {
    return (
      <button type="button" className="report-link" onClick={() => setOpen(true)}>
        Report
      </button>
    );
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={reason}
        maxLength={REPORT_REASON_MAX}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What's wrong with this review?"
        aria-label="Reason for reporting"
        autoFocus
      />
      <button type="submit" className="btn btn-secondary" disabled={state === "sending"}>
        Send
      </button>
      <button type="button" className="report-link" onClick={() => setOpen(false)}>
        Cancel
      </button>
      {error && <span className="auth-error">{error}</span>}
    </form>
  );
}
