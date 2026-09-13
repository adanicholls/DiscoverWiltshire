import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TOWNS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Browse by town — Discover Wiltshire",
};

export default function TownsPage() {
  return (
    <>
      <Header />

      <main className="wrap">
        <h1 className="page-title">Browse by town</h1>
        <p className="page-subtitle">
          Every ranking on Discover Wiltshire, grouped by the town nearest you — pick one to see what&apos;s good
          nearby.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 8,
            margin: "16px 0 28px",
          }}
        >
          {TOWNS.map((town) => (
            <Link key={town.id} className="card" href={`/towns/${town.id}`} style={{ cursor: "pointer" }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{town.label}</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>see what&apos;s ranked here</div>
            </Link>
          ))}
        </div>

        <div className="cta-band">
          <h3>own a business in Wiltshire?</h3>
          <p>get discovered by the people already looking for you</p>
          <a className="btn btn-primary" href="/list-your-business">
            List your business
          </a>
        </div>
      </main>

      <Footer />
    </>
  );
}
