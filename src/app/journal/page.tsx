import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Journal — Discover Wiltshire",
};

export default function JournalPage() {
  return (
    <>
      <Header />
      <main className="wrap" style={{ maxWidth: 640 }}>
        <h1 className="page-title">journal</h1>
        <p className="placeholder-note">
          This page is a placeholder — what goes in the journal, and who writes it, hasn&apos;t been decided yet. For
          now it&apos;s just an intro so the nav link isn&apos;t dead.
        </p>
        <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.7 }}>
          Discover Wiltshire started as a simple idea: the county&apos;s best places shouldn&apos;t be something you
          only find out about by chance. Every listing here is ranked by the people who actually visit — not by who
          pays the most, and not by us.
        </p>
      </main>
      <Footer />
    </>
  );
}
