import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import TradeChips from "@/components/TradeChips";
import Leaderboard from "@/components/Leaderboard";
import { TRADE_CATEGORIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Trades & services in Wiltshire, ranked — Discover Wiltshire",
};

export default function TradesPage() {
  return (
    <>
      <Header />

      <main className="wrap">
        <h1 className="page-title">Trades &amp; services, ranked</h1>
        <p className="page-subtitle">
          Every painter, plumber, electrician, and local professional in the county, ranked by the people who&apos;ve
          actually hired them.
        </p>

        <CategoryTabs active="/trades" />
        <TradeChips />

        <div className="period-toggle">
          <button className="active">Today</button>
          <span>·</span>
          <button>This week</button>
          <span>·</span>
          <button>This month</button>
        </div>

        <Leaderboard categories={TRADE_CATEGORIES.map((c) => c.id)} showCategoryTag />

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
