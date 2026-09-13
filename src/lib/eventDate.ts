// Formats an event's ISO timestamp for display, always in UK time
// regardless of where the page happens to render (Vercel's serverless
// functions default to UTC) - the whole audience is Wiltshire, so there's
// no per-viewer timezone to account for.
export interface FormattedEventDate {
  weekday: string;
  day: string;
  month: string;
  monthLong: string;
  year: string;
  time: string;
}

export function formatEventDate(iso: string): FormattedEventDate {
  const date = new Date(iso);
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "Europe/London" }).format(date);
  const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "Europe/London" }).format(date);
  const month = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "Europe/London" }).format(date);
  const monthLong = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "Europe/London" }).format(date);
  const year = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Europe/London" }).format(date);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  }).format(date);
  return { weekday, day, month, monthLong, year, time };
}

/** Groups events (already sorted by date) into "July 2026"-style month buckets. */
export function groupEventsByMonth<T extends { startsAt: string }>(events: T[]): { label: string; events: T[] }[] {
  const groups: { label: string; events: T[] }[] = [];
  for (const ev of events) {
    const { monthLong, year } = formatEventDate(ev.startsAt);
    const label = `${monthLong} ${year}`;
    let group = groups[groups.length - 1];
    if (!group || group.label !== label) {
      group = { label, events: [] };
      groups.push(group);
    }
    group.events.push(ev);
  }
  return groups;
}
