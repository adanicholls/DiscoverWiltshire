"use client";

import { useState, useTransition } from "react";
import { addCategory } from "@/app/admin/actions";

export default function AddCategoryForm() {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await addCategory(name);
        setName("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <input
          type="text"
          placeholder="e.g. Motoring, Solar installers"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%" }}
        />
        {error && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{error}</div>}
      </div>
      <button className="btn btn-primary" type="submit" disabled={pending || !name.trim()}>
        {pending ? "Adding…" : "Add category"}
      </button>
    </form>
  );
}
