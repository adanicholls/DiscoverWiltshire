"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateCategoryLabel, deleteCategory } from "@/app/admin/actions";

export default function CategoryRow({ id, label }: { id: string; label: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateCategoryLabel(id, value);
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${label}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteCategory(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        {editing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            style={{ width: "100%" }}
          />
        ) : (
          <>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
            <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>
              /trades/{id} · <Link href={`/trades/${id}`}>view</Link>
            </div>
          </>
        )}
        {error && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{error}</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {editing ? (
          <>
            <button className="btn btn-primary" disabled={pending} onClick={handleSave}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              className="btn btn-secondary"
              disabled={pending}
              onClick={() => {
                setValue(label);
                setEditing(false);
                setError(null);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-secondary" disabled={pending} onClick={() => setEditing(true)}>
              Rename
            </button>
            <button className="btn btn-secondary" style={{ color: "var(--danger)" }} disabled={pending} onClick={handleDelete}>
              {pending ? "Deleting…" : "Delete"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
