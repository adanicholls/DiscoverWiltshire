"use client";

import { useState, useTransition } from "react";
import { deleteJournalEntry } from "@/app/admin/journal-actions";

export default function DeleteJournalButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(`Permanently delete "${title}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteJournalEntry(id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <>
      <button className="btn btn-secondary" style={{ color: "var(--danger)" }} disabled={pending} onClick={handleClick}>
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && <span style={{ fontSize: 12, color: "var(--danger)", width: "100%" }}>{error}</span>}
    </>
  );
}
