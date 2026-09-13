import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { TOWN_LABELS } from "@/lib/data";
import { formatEventDate } from "@/lib/eventDate";
import DeleteEventButton from "@/components/admin/DeleteEventButton";

export const metadata: Metadata = {
  title: "Events — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

const STATUS_COLORS: Record<string, string> = {
  approved: "var(--green)",
  pending: "var(--mustard-ink)",
  declined: "var(--danger)",
};

export default async function AdminEventsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: events, error } = await supabase.from("events").select("*").order("starts_at");

  if (error) {
    return <div className="card" style={{ marginTop: 24 }}>Couldn&apos;t load events: {error.message}</div>;
  }

  return (
    <>
      <h1 className="page-title">events</h1>
      <p className="page-subtitle">Every event regardless of status — edit anything, or clean up test/duplicate rows.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {(events ?? []).length === 0 && (
          <div className="card" style={{ textAlign: "center", opacity: 0.6 }}>
            No events yet.
          </div>
        )}
        {(events ?? []).map((ev) => {
          const { weekday, day, month, time } = formatEventDate(ev.starts_at);
          return (
            <div key={ev.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{ev.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: STATUS_COLORS[ev.status] }}>{ev.status}</span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
                  {weekday} {day} {month}, {time} · {ev.venue}
                  {ev.town_id ? ` · ${TOWN_LABELS[ev.town_id] || ev.town_id}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link className="btn btn-secondary" href={`/admin/events/${ev.id}/edit`}>
                  Edit
                </Link>
                <DeleteEventButton id={ev.id} name={ev.name} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
