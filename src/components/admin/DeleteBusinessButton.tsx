"use client";

import { useTransition } from "react";
import { deleteBusiness } from "@/app/admin/actions";

export default function DeleteBusinessButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Permanently delete "${name}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteBusiness(id);
    });
  }

  return (
    <button className="btn btn-secondary" style={{ color: "var(--danger)" }} disabled={pending} onClick={handleClick}>
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
