import Link from "next/link";
import { Store } from "@/lib/store";
import { TOWN_LABELS } from "@/lib/data";
import { formatEventDate } from "@/lib/eventDate";

/** Compact upcoming-events list for the homepage sidebar - the shape
 * borrows from producthunt.com's "Upcoming events" panel next to its
 * ranked list. The full grouped calendar lives at /whats-on
 * (see EventCalendar). */
export default async function EventsList({ limit = 4 }: { limit?: number }) {
  const events = await Store.getUpcomingEvents(limit);

  if (events.length === 0) {
    return <p style={{ fontSize: 13, opacity: 0.6 }}>Nothing on the calendar right now.</p>;
  }

  return (
    <div>
      {events.map((ev, i) => {
        const { weekday, day, month } = formatEventDate(ev.startsAt);
        return (
          <Link
            href="/whats-on"
            key={ev.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--border)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ textAlign: "center", minWidth: 32 }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", opacity: 0.6 }}>{weekday}</div>
              <div style={{ fontFamily: "var(--font-voice)", fontSize: 17, lineHeight: 1.1 }}>{day}</div>
              <div style={{ fontSize: 9, textTransform: "uppercase", opacity: 0.6 }}>{month}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{ev.name}</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                {ev.venue}
                {ev.town ? ` · ${TOWN_LABELS[ev.town] || ev.town}` : ""}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
