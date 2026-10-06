"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteReview, resolveReportsFor, setReviewStatus, type AdminResult } from "@/app/admin/member-actions";
import Stars from "@/components/members/Stars";
import type { ReviewStatus } from "@/lib/members";

interface Props {
  id: string;
  businessId: string;
  businessName: string;
  authorName: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  createdAt: string;
  /** Reasons given by members who reported this review (empty if none). */
  reports: string[];
}

/** One review in the moderation screen, with whatever actions make sense for
 * its current state. */
export default function ReviewModerationRow({ id, businessId, businessName, authorName, rating, body, status, createdAt, reports }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(label: string, action: () => Promise<AdminResult>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) setMessage(label);
      else setError(result.error ?? "Something went wrong");
    });
  }

  return (
    <div className="card" style={{ marginBottom: 8, opacity: message ? 0.55 : 1 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <Link href={`/business/${businessId}`} style={{ fontSize: 14, fontWeight: 500 }}>
          {businessName}
        </Link>
        <Stars rating={rating} size={14} />
        <span style={{ fontSize: 12, opacity: 0.65 }}>
          by {authorName} · {new Date(createdAt).toLocaleString("en-GB")} · {status}
        </span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.6, margin: "8px 0" }}>{body}</p>

      {reports.length > 0 && (
        <ul style={{ margin: "0 0 10px", paddingLeft: 18, fontSize: 12, color: "var(--danger)" }}>
          {reports.map((r, i) => (
            <li key={i}>Reported: {r}</li>
          ))}
        </ul>
      )}

      {error && <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 8 }}>{error}</div>}

      {message ? (
        <span style={{ fontSize: 12, fontWeight: 500 }}>{message}</span>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {status !== "approved" && (
            <button
              className="btn"
              style={{ background: "var(--green)", color: "#fff" }}
              disabled={pending}
              onClick={() => run("Approved", () => setReviewStatus(id, "approved"))}
            >
              Approve
            </button>
          )}
          {status !== "declined" && (
            <button className="btn btn-secondary" disabled={pending} onClick={() => run("Declined", () => setReviewStatus(id, "declined"))}>
              {status === "approved" ? "Take down" : "Decline"}
            </button>
          )}
          {reports.length > 0 && (
            <button className="btn btn-secondary" disabled={pending} onClick={() => run("Reports dismissed", () => resolveReportsFor(id))}>
              Dismiss reports
            </button>
          )}
          <button
            className="btn btn-secondary"
            disabled={pending}
            onClick={() => run("Deleted", () => deleteReview(id), "Delete this review permanently?")}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
