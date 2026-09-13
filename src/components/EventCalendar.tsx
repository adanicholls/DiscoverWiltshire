import { Store } from "@/lib/store";
import { TOWN_LABELS } from "@/lib/data";
import { formatEventDate, groupEventsByMonth } from "@/lib/eventDate";

/** The full /whats-on calendar: every upcoming approved event, grouped
 * into month sections, each row showing a date badge, a placeholder photo
 * block, the event's details, and a ticket/details link if one was given -
 * the same shape as Live Nation's event calendar, in this site's own
 * design language. */
export default async function EventCalendar() {
  const events = await Store.getUpcomingEvents();

  if (events.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", opacity: 0.6, fontSize: 13 }}>
        Nothing on the calendar right now — be the first to add one.
      </div>
    );
  }

  const groups = groupEventsByMonth(events);

  return (
    <div>
      {groups.map((group) => (
        <div key={group.label}>
          <h2 className="event-month-heading">{group.label}</h2>
          {group.events.map((ev) => {
            const { weekday, day, month, time } = formatEventDate(ev.startsAt);
            const hasLink = ev.website && ev.website !== "#";
            return (
              <div className="event-row" key={ev.id}>
                <div className="event-date">
                  <span className="event-date-weekday">{weekday}</span>
                  <span className="event-date-day">{day}</span>
                  <span className="event-date-month">{month}</span>
                </div>
                <div className="event-thumb" style={{ background: ev.photoColor }} />
                <div className="event-info">
                  <div className="event-title">{ev.name}</div>
                  <div className="event-meta">
                    {ev.venue}
                    {ev.town ? ` · ${TOWN_LABELS[ev.town] || ev.town}` : ""} · {time}
                  </div>
                  {ev.priceText && <div className="event-meta">{ev.priceText}</div>}
                </div>
                {hasLink && (
                  <a className="btn btn-primary event-cta" href={ev.website} target="_blank" rel="noopener noreferrer">
                    Details
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
