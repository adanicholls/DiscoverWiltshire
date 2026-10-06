"use client";

import { useState, useTransition } from "react";
import { setMemberBanned } from "@/app/admin/member-actions";

export default function BanMemberButton({ memberId, name, banned }: { memberId: string; name: string; banned: boolean }) {
  const [pending, startTransition] = useTransition();
  const [isBanned, setIsBanned] = useState(banned);
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !isBanned;
    if (next && !window.confirm(`Stop ${name} from posting reviews? They'll still be able to sign in and read.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await setMemberBanned(memberId, next);
      if (result.ok) setIsBanned(next);
      else setError(result.error ?? "Something went wrong");
    });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {error && <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>}
      <button className="btn btn-secondary" disabled={pending} onClick={toggle}>
        {isBanned ? "Allow posting again" : "Ban from posting"}
      </button>
    </div>
  );
}
