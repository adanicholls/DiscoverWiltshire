import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Our story — Discover Wiltshire",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="wrap" style={{ maxWidth: 640 }}>
        <h1 className="page-title">our story</h1>
        <p className="placeholder-note">
          This page hasn&apos;t been written yet in the design brief — this is placeholder copy so the nav link
          isn&apos;t dead. Worth writing for real once the rest of the site is settled, since it&apos;s where the
          &quot;official, trusted authority&quot; side of the brand gets to speak in full.
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
