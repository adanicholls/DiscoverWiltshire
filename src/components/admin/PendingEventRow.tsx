"use client";

import { useState, useTransition } from "react";
import { approveEvent, declineEvent } from "@/app/admin/actions";
import { formatEventDate } from "@/lib/eventDate";

interface Props {
  id: string;
  name: string;
  venue: string;
  townLabel: string | null;
  startsAt: string;
  createdAt: string;
}

export default function PendingEventRow({ id, name, venue, townLabel, startsAt, createdAt }: Props) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<"approved" | "declined" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handle(action: "approve" | "decline") {
    setError(null);
    startTransition(async () => {
      try {
        if (action === "approve") {
          await approveEvent(id);
          setDone("approved");
        } else {
          await declineEvent(id);
          setDone("declined");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  const { weekday, day, month, time } = formatEventDate(startsAt);

  return (
    <div className="card aq-row" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8, opacity: done ? 0.55 : 1 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span className="tag tag-new">New event</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
        </div>
        <div style={{ fontSize: 12, opacity: 0.65 }}>
          {weekday} {day} {month}, {time} · {venue}
          {townLabel ? ` · ${townLabel}` : ""}
        </div>
        <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>submitted {new Date(createdAt).toLocaleString()}</div>
        {error && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{error}</div>}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        {done ? (
          <span style={{ fontSize: 12, fontWeight: 500, color: done === "approved" ? "var(--green)" : "var(--danger)" }}>
            {done === "approved" ? "Approved" : "Declined"}
          </span>
        ) : (
          <>
            <button className="btn" style={{ background: "var(--green)", color: "#fff" }} disabled={pending} onClick={() => handle("approve")}>
              Approve
            </button>
            <button className="btn btn-secondary" disabled={pending} onClick={() => handle("decline")}>
              Decline
            </button>
          </>
        )}
      </div>
    </div>
  );
}
