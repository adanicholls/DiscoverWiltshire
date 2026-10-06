import type { Metadata } from "next";
import TradeCards from "@/components/TradeCards";
import Leaderboard from "@/components/Leaderboard";
import { Store } from "@/lib/store";
import { TOWN_LABELS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Trades & services in Wiltshire, ranked — Discover Wiltshire",
};

// Reached from the "Trades & services" link in the sidebar, and also
// discoverable via search.
export default async function TradesPage({ searchParams }: PageProps<"/trades">) {
  const params = await searchParams;
  const town = typeof params.town === "string" ? params.town : undefined;
  const townLabel = town ? TOWN_LABELS[town] : undefined;
  const tradeCategories = await Store.getTradeCategories();

  return (
    <>
      <div className="wrap">
        <h1 className="page-title">Trades &amp; services{townLabel ? ` near ${townLabel}` : ""}, ranked</h1>
        <p className="page-subtitle">
          Every painter, plumber, electrician, and local professional {townLabel ? `near ${townLabel}` : "in the county"},
          ranked by the people who&apos;ve actually hired them.
        </p>

        <TradeCards categories={tradeCategories} town={town} />

        <h2 className="section-heading">Top trades &amp; services{townLabel ? ` near ${townLabel}` : ""}</h2>
        <Leaderboard categories={tradeCategories.map((c) => c.id)} town={town} showCategoryTag />

        <div className="cta-band">
          <h3>run a trade or local service?</h3>
          <p>get listed for free, or buy a promoted slot to be seen today</p>
          <a className="btn btn-primary" href="/list-your-business">List your business</a>
        </div>
      </div>
    </>
  );
}
