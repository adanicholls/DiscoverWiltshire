import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import Leaderboard from "@/components/Leaderboard";
import { TOWN_LABELS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shops in Wiltshire, ranked — Discover Wiltshire",
};

export default async function ShopsPage({ searchParams }: PageProps<"/shops">) {
  const params = await searchParams;
  const town = typeof params.town === "string" ? params.town : undefined;
  const townLabel = town ? TOWN_LABELS[town] : undefined;

  return (
    <>
      <Header />

      <main className="wrap">
        <h1 className="page-title">Shops{townLabel ? ` near ${townLabel}` : ""}, ranked</h1>
        <p className="page-subtitle">
          Local shops and services worth knowing about {townLabel ? `near ${townLabel}` : ""}, ranked by the people
          who use them.
        </p>

        <CategoryTabs active="/shops" />
        <div className="period-toggle">
          <button className="active">Today</button>
          <span>·</span>
          <button>This week</button>
          <span>·</span>
          <button>This month</button>
        </div>

        <Leaderboard category="shops" town={town} />

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
