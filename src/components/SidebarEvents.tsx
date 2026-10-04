import Link from "next/link";
import EventsList from "@/components/EventsList";
import { TOWN_LABELS } from "@/lib/data";

/** The "what's on" card that sits in the right-hand column - the whole
 * county's next few events, or just one town's when `town` is given. */
export default function SidebarEvents({ town }: { town?: string }) {
  const townLabel = town ? TOWN_LABELS[town] : undefined;

  return (
    <div className="sidebar-card">
      <div className="sidebar-card-header">
        <h2 className="section-heading">{townLabel ? `what's on in ${townLabel}` : "what's on"}</h2>
        <Link href={town ? `/whats-on?town=${town}` : "/whats-on"}>See all →</Link>
      </div>
      <EventsList limit={3} town={town} />
    </div>
  );
}
