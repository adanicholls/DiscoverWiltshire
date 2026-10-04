import Link from "next/link";
import { Store } from "@/lib/store";
import { TOWN_LABELS } from "@/lib/data";
import { formatEventDate } from "@/lib/eventDate";

/** Compact upcoming-events list for a sidebar - the homepage's (all of
 * Wiltshire) and each town hub's (just that town, via `town`). The shape
 * borrows from producthunt.com's "Upcoming events" panel next to its
 * ranked list. The full grouped calendar lives at /whats-on
 * (see EventCalendar). */
export default async function EventsList({ limit = 3, town }: { limit?: number; town?: string }) {
  const events = await Store.getUpcomingEvents(limit, town);
  const townLabel = town ? TOWN_LABELS[town] : undefined;
  // A town's rows lead into that town's filtered calendar, not the whole county's.
  const calendarHref = town ? `/whats-on?town=${town}` : "/whats-on";

  if (events.length === 0) {
    return (
      <p style={{ fontSize: 13, opacity: 0.6, margin: "8px 0 0" }}>
        {townLabel ? `Nothing on in ${townLabel} right now.` : "Nothing on the calendar right now."}{" "}
        <Link href="/whats-on/add" style={{ textDecoration: "underline" }}>
          Add your event
        </Link>
      </p>
    );
  }

  return (
    <div>
      {events.map((ev) => {
        const { weekday, day, month } = formatEventDate(ev.startsAt);
        return (
          <Link href={calendarHref} key={ev.id} className="event-side-row">
            <div style={{ textAlign: "center", minWidth: 32 }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", opacity: 0.6 }}>{weekday}</div>
              <div style={{ fontFamily: "var(--font-voice)", fontSize: 17, lineHeight: 1.1 }}>{day}</div>
              <div style={{ fontSize: 9, textTransform: "uppercase", opacity: 0.6 }}>{month}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{ev.name}</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                {ev.venue}
                {ev.town && !town ? ` · ${TOWN_LABELS[ev.town] || ev.town}` : ""}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
