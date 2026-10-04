import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import Leaderboard from "@/components/Leaderboard";
import PageSidebar from "@/components/PageSidebar";
import { CATEGORY_LABELS_CORE, TOWN_LABELS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Eat & drink in Wiltshire, ranked — Discover Wiltshire",
};

export default async function EatDrinkPage({ searchParams }: PageProps<"/eat-drink">) {
  const params = await searchParams;
  const town = typeof params.town === "string" ? params.town : undefined;
  const townLabel = town ? TOWN_LABELS[town] : undefined;

  return (
    <>
      <Header />

      <main className="wrap">
        <h1 className="page-title">Eat &amp; drink{townLabel ? ` near ${townLabel}` : ""}, ranked</h1>
        <p className="page-subtitle">
          Every pub, café, and restaurant {townLabel ? `near ${townLabel}` : "in the county"}, ranked by the people
          who actually eat there.
        </p>

        <CategoryTabs active="/eat-drink" />

        <div className="home-layout home-layout--single-row">
          <div className="home-main">
            <div className="period-toggle">
              <button className="active">Today</button>
              <span>·</span>
              <button>This week</button>
              <span>·</span>
              <button>This month</button>
            </div>

            <Leaderboard category="eat-drink" town={town} />
          </div>

          <PageSidebar
            sponsor={{ type: "category", id: "eat-drink", label: CATEGORY_LABELS_CORE["eat-drink"] }}
            town={townLabel ? town : undefined}
          />
        </div>

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
