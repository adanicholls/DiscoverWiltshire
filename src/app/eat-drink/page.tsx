import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import Leaderboard from "@/components/Leaderboard";
import { CATEGORY_SPONSORS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Eat & drink in Wiltshire, ranked — Discover Wiltshire",
};

export default function EatDrinkPage() {
  const sponsor = CATEGORY_SPONSORS["eat-drink"];

  return (
    <>
      <Header />

      {sponsor && (
        <div className="category-sponsor">
          <div className="wrap" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span>eat &amp; drink — in partnership with {sponsor}</span>
            <span style={{ opacity: 0.6 }}>category sponsor</span>
          </div>
        </div>
      )}

      <main className="wrap">
        <h1 className="page-title">Eat &amp; drink, ranked</h1>
        <p className="page-subtitle">Every pub, café, and restaurant in the county, ranked by the people who actually eat there.</p>

        <CategoryTabs active="/eat-drink" />
        <div className="period-toggle">
          <button className="active">Today</button>
          <span>·</span>
          <button>This week</button>
          <span>·</span>
          <button>This month</button>
        </div>

        <Leaderboard category="eat-drink" />

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
