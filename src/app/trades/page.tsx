import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TradeChips from "@/components/TradeChips";
import Leaderboard from "@/components/Leaderboard";
import { Store } from "@/lib/store";
import { TOWN_LABELS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Trades & services in Wiltshire, ranked — Discover Wiltshire",
};

// Kept for SEO/direct linking (see AGENTS.md-adjacent nav notes in
// Header.tsx and CategoryTabs.tsx) even though it's no longer a top-level
// nav item - trades & services is primarily discoverable via search now.
export default async function TradesPage({ searchParams }: PageProps<"/trades">) {
  const params = await searchParams;
  const town = typeof params.town === "string" ? params.town : undefined;
  const townLabel = town ? TOWN_LABELS[town] : undefined;
  const tradeCategories = await Store.getTradeCategories();

  return (
    <>
      <Header />

      <main className="wrap">
        <h1 className="page-title">Trades &amp; services{townLabel ? ` near ${townLabel}` : ""}, ranked</h1>
        <p className="page-subtitle">
          Every painter, plumber, electrician, and local professional {townLabel ? `near ${townLabel}` : "in the county"},
          ranked by the people who&apos;ve actually hired them.
        </p>

        <TradeChips />

        <div className="period-toggle">
          <button className="active">Today</button>
          <span>·</span>
          <button>This week</button>
          <span>·</span>
          <button>This month</button>
        </div>

        <Leaderboard categories={tradeCategories.map((c) => c.id)} town={town} showCategoryTag />

        <div className="cta-band">
          <h3>run a trade or local service?</h3>
          <p>get listed for free, or buy a promoted slot to be seen today</p>
          <a className="btn btn-primary" href="/list-your-business">List your business</a>
        </div>
      </main>

      <Footer />
    </>
  );
}
