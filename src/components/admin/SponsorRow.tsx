"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { deleteSponsorship } from "@/app/admin/actions";
import { readableTextOn, websiteDomain } from "@/lib/sponsors";
import SponsorForm, { type SponsorFormInitial } from "@/components/admin/SponsorForm";

interface Option {
  id: string;
  label: string;
}

interface Props {
  sponsor: SponsorFormInitial;
  /** "Eat & drink" or "Devizes" - the page this sponsor is on. */
  targetLabel: string;
  categoryOptions: Option[];
  townOptions: Option[];
}

export default function SponsorRow({ sponsor, targetLabel, categoryOptions, townOptions }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(`Remove ${sponsor.sponsorName} as the sponsor of ${targetLabel}? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteSponsorship(sponsor.id);
      if (!result.ok) setError(result.error);
    });
  }

  if (editing) {
    return (
      <div className="card" style={{ marginBottom: 8 }}>
        <SponsorForm
          categoryOptions={categoryOptions}
          townOptions={townOptions}
          initial={sponsor}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  const domain = websiteDomain(sponsor.website);

  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
      {sponsor.imageUrl ? (
        <Image
          src={sponsor.imageUrl}
          alt=""
          width={48}
          height={48}
          style={{ objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 20,
            background: sponsor.photoColor,
            color: readableTextOn(sponsor.photoColor),
          }}
        >
          {sponsor.sponsorName.trim().charAt(0).toUpperCase()}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{sponsor.sponsorName}</div>
        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
          {targetLabel} · {sponsor.targetType}
          {domain ? ` · ${domain}` : ""}
        </div>
        {sponsor.headline && <div style={{ fontSize: 12, opacity: 0.65 }}>{sponsor.headline}</div>}
        {error && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{error}</div>}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-secondary" disabled={pending} onClick={() => setEditing(true)}>
          Edit
        </button>
        <button className="btn btn-secondary" style={{ color: "var(--danger)" }} disabled={pending} onClick={handleDelete}>
          {pending ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  );
}
