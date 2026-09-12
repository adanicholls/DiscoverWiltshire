import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventsList from "@/components/EventsList";

export const metadata: Metadata = {
  title: "What's on — Discover Wiltshire",
};

export default function WhatsOnPage() {
  return (
    <>
      <Header />
      <main className="wrap" style={{ maxWidth: 640 }}>
        <h1 className="page-title">what&apos;s on</h1>
        <p className="placeholder-note">
          This page is a placeholder — the design brief covered events as a homepage strip, not a full calendar.
          Worth deciding whether this becomes a full events calendar (with its own submission flow, much like
          listings) or stays a lightweight &quot;this week&quot; list.
        </p>
        <EventsList />
      </main>
      <Footer />
    </>
  );
}
