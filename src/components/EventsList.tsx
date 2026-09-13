import Link from "next/link";
import { Store } from "@/lib/store";
import { TOWN_LABELS } from "@/lib/data";
import { formatEventDate } from "@/lib/eventDate";

/** Compact upcoming-events strip for the homepage. The full grouped
 * calendar lives on /whats-on (see EventCalendar). */
export default async function EventsList({ limit = 4 }: { limit?: number }) {
  const events = await Store.getUpcomingEvents(limit);

  if (events.length === 0) {
    return <p style={{ fontSize: 13, opacity: 0.6 }}>Nothing on the calendar right now.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {events.map((ev) => {
        const { weekday, day, month } = formatEventDate(ev.startsAt);
        return (
          <Link
            href="/whats-on"
            key={ev.id}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}
          >
            <div style={{ textAlign: "center", minWidth: 36 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", opacity: 0.6 }}>{weekday}</div>
              <div style={{ fontFamily: "var(--font-voice)", fontSize: 18, lineHeight: 1.1 }}>{day}</div>
              <div style={{ fontSize: 10, textTransform: "uppercase", opacity: 0.6 }}>{month}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{ev.name}</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
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
