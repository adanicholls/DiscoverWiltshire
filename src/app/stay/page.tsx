import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import Leaderboard from "@/components/Leaderboard";
import { TOWN_LABELS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Stay in Wiltshire, ranked — Discover Wiltshire",
};

export default async function StayPage({ searchParams }: PageProps<"/stay">) {
  const params = await searchParams;
  const town = typeof params.town === "string" ? params.town : undefined;
  const townLabel = town ? TOWN_LABELS[town] : undefined;

  return (
    <>
      <Header />

      <main className="wrap">
        <h1 className="page-title">Stay{townLabel ? ` near ${townLabel}` : ""}, ranked</h1>
        <p className="page-subtitle">
          B&amp;Bs, cottages, and places to sleep {townLabel ? `near ${townLabel}` : ""}, ranked by the people
          who&apos;ve stayed there.
        </p>

        <CategoryTabs active="/stay" />
        <div className="period-toggle">
          <button className="active">Today</button>
          <span>·</span>
          <button>This week</button>
          <span>·</span>
          <button>This month</button>
        </div>

        <Leaderboard category="stay" town={town} />

        <div className="cta-band">
          <h3>think your business belongs on this list?</h3>
          <p>get listed for free, or buy a promoted slot to be seen today</p>
          <a className="btn btn-primary" href="/list-your-business">List your business</a>
        </div>
      </main>

      <Footer />
    </>
  );
}
