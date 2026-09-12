import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import Leaderboard from "@/components/Leaderboard";

export const metadata: Metadata = {
  title: "Shops in Wiltshire, ranked — Discover Wiltshire",
};

export default function ShopsPage() {
  return (
    <>
      <Header />

      <main className="wrap">
        <h1 className="page-title">Shops, ranked</h1>
        <p className="page-subtitle">Local shops and services worth knowing about, ranked by the people who use them.</p>

        <CategoryTabs active="/shops" />
        <div className="period-toggle">
          <button className="active">Today</button>
          <span>·</span>
          <button>This week</button>
          <span>·</span>
          <button>This month</button>
        </div>

        <Leaderboard category="shops" />

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
