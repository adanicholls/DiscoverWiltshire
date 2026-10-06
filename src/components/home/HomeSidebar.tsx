import Link from "next/link";
import { TOWN_LABELS } from "@/lib/data";
import { formatEventDate } from "@/lib/eventDate";
import { entryHref, entryIsExternal, formatJournalDate, type JournalSummary } from "@/lib/journal";
import type { LiveEvent } from "@/lib/store";
import HomeNavLinks from "./HomeNavLinks";
import { ArticleIcon, ChevronRightIcon } from "./icons";

interface Props {
  journal: JournalSummary[];
  events: LiveEvent[];
}

/** The left column: page links, then "Trending" (the latest Journal
 * entries, standing in for Product Hunt's forum threads) and "Upcoming
 * events". Like Product Hunt's it scrolls with the page rather than
 * sticking. */
export default function HomeSidebar({ journal, events }: Props) {
  return (
    <aside className="ph-aside">
      <div className="ph-sidebar">
        <HomeNavLinks />

        <hr className="ph-divider" />

        <section aria-labelledby="ph-trending">
          <div className="ph-side-head">
            <h2 id="ph-trending" className="ph-side-title">
              From the Journal
            </h2>
            <Link href="/journal" className="ph-side-more">
              View all
            </Link>
          </div>
          {journal.length === 0 ? (
            <p className="ph-side-empty">Nothing published yet.</p>
          ) : (
            <ul className="ph-thread-list">
              {journal.map((entry) => {
                const href = entryHref(entry);
                const external = entryIsExternal(entry);
                const body = (
                  <>
                    <span className="ph-thread-icon" aria-hidden="true">
                      <ArticleIcon size={14} />
                    </span>
                    <span className="ph-thread-text">
                      <span className="ph-thread-title">{entry.title}</span>
                      <span className="ph-thread-meta">
                        {entry.category || (external ? "News" : "Journal")} · {formatJournalDate(entry.publishedAt)}
                      </span>
                    </span>
                  </>
                );
                return (
                  <li key={entry.id}>
                    {href ? (
                      <Link
                        href={href}
                        className="ph-thread"
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className="ph-thread">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="ph-events" className="ph-events">
          <div className="ph-side-head">
            <h2 id="ph-events" className="ph-events-title">
              Upcoming events
            </h2>
          </div>
          {events.length === 0 ? (
            <p className="ph-side-empty">
              Nothing on the calendar right now.{" "}
              <Link href="/whats-on/add" className="ph-inline-link">
                Add your event
              </Link>
            </p>
          ) : (
            <ul className="ph-event-list">
              {events.map((ev) => {
                const { day, month } = formatEventDate(ev.startsAt);
                const outside = /^https?:\/\//i.test(ev.website);
                const place = [ev.venue, ev.town ? TOWN_LABELS[ev.town] || ev.town : ""].filter(Boolean).join(" · ");
                return (
                  <li key={ev.id}>
                    <Link
                      href={outside ? ev.website : "/whats-on"}
                      className="ph-event"
                      {...(outside ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <span className="ph-date-badge" aria-hidden="true">
                        <span className="ph-date-month">{month}</span>
                        <span className="ph-date-day">{day}</span>
                      </span>
                      <span className="ph-event-text">
                        <span className="ph-event-title">{ev.name}</span>
                        {place && <span className="ph-event-sub">{place}</span>}
                        {ev.description && <span className="ph-event-desc">{ev.description}</span>}
                      </span>
                      <ChevronRightIcon size={18} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/whats-on" className="ph-side-more ph-events-more">
            See the full calendar
          </Link>
          <Link href="/whats-on/add" className="ph-side-more">
            Add your event
          </Link>
        </section>
      </div>
    </aside>
  );
}
