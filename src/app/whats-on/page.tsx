import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCalendar from "@/components/EventCalendar";

export const metadata: Metadata = {
  title: "What's on in Wiltshire — Discover Wiltshire",
};

export default function WhatsOnPage() {
  return (
    <>
      <Header />
      <main className="wrap" style={{ maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="page-title">what&apos;s on</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Markets, live music, and local events across Wiltshire — added by the people running them.
            </p>
          </div>
          <Link className="btn btn-primary" href="/whats-on/add" style={{ flexShrink: 0 }}>
            + Add your event
          </Link>
        </div>

        <div style={{ marginTop: 22 }}>
          <EventCalendar />
        </div>
      </main>
      <Footer />
    </>
  );
}
