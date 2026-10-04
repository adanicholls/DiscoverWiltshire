import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCalendar from "@/components/EventCalendar";
import { TOWN_LABELS } from "@/lib/data";

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

  return (
    <>
      <Header />
      <main className="wrap" style={{ maxWidth: 720 }}>
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

        <div style={{ marginTop: 22 }}>
          <EventCalendar town={town} />
        </div>
      </main>
      <Footer />
    </>
  );
}
