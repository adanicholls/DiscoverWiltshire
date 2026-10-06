"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMyReview } from "@/app/member-actions";

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("Delete this review? This can't be undone.")) return;
    setBusy(true);
    setError(null);
    const result = await deleteMyReview(reviewId);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Couldn't delete that review.");
      return;
    }
    router.refresh();
  }

  return (
    <>
      <button type="button" className="report-link" onClick={handleDelete} disabled={busy}>
        {busy ? "Deleting…" : "Delete"}
      </button>
      {error && <span className="auth-error">{error}</span>}
    </>
  );
}
