import type { Metadata } from "next";
import Link from "next/link";
import EventCalendar from "@/components/EventCalendar";
import FeaturedEventCard from "@/components/events/FeaturedEventCard";
import { TOWN_LABELS } from "@/lib/data";
import { Store } from "@/lib/store";

export const metadata: Metadata = {
  title: "What's on in Wiltshire — Discover Wiltshire",
};

export default async function WhatsOnPage({ searchParams }: PageProps<"/whats-on">) {
  const params = await searchParams;
  // Only honour a town we actually know - an unrecognised ?town= falls back
  // to the whole county rather than showing an empty, unexplained list.
  const requestedTown = typeof params.town === "string" ? params.town : undefined;
  const townLabel = requestedTown ? TOWN_LABELS[requestedTown] : undefined;
  const town = townLabel ? requestedTown : undefined;

  // The banner slot: shown first on the county-wide page, and on a town's
  // page only if the event is in that town. It's then left out of the list
  // below so it doesn't appear twice.
  const featuredCandidate = await Store.getFeaturedEvent();
  const featured = featuredCandidate && (!town || featuredCandidate.town === town) ? featuredCandidate : null;

  return (
    <>
      <div className="wrap" style={{ maxWidth: 900 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="page-title">what&apos;s on{townLabel ? ` near ${townLabel}` : ""}</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              {townLabel ? (
                <>
                  Local events near {townLabel}. <Link href="/whats-on" style={{ textDecoration: "underline" }}>Show all of Wiltshire</Link>
                </>
              ) : (
                "Markets, live music, and local events across Wiltshire — added by the people running them."
              )}
            </p>
          </div>
          <Link className="btn btn-primary" href="/whats-on/add" style={{ flexShrink: 0 }}>
            + Add your event
          </Link>
        </div>

        {featured && (
          <div style={{ marginTop: 26 }}>
            <FeaturedEventCard event={featured} />
          </div>
        )}

        <div style={{ marginTop: featured ? 0 : 22 }}>
          <EventCalendar town={town} excludeId={featuredCandidate?.id} />
        </div>
      </div>
    </>
  );
}
