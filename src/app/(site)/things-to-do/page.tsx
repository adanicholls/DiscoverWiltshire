import type { Metadata } from "next";
import CategoryTabs from "@/components/CategoryTabs";
import Leaderboard from "@/components/Leaderboard";
import PageSidebar from "@/components/PageSidebar";
import { CATEGORY_LABELS_CORE, TOWN_LABELS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Things to do in Wiltshire, ranked — Discover Wiltshire",
};

export default async function ThingsToDoPage({ searchParams }: PageProps<"/things-to-do">) {
  const params = await searchParams;
  const town = typeof params.town === "string" ? params.town : undefined;
  const townLabel = town ? TOWN_LABELS[town] : undefined;

  return (
    <>
      <div className="wrap">
        <div className="home-layout home-layout--single-row home-layout--titled">
          <div className="home-main">
            <div className="page-head">
              <h1 className="page-title">Things to do{townLabel ? ` near ${townLabel}` : ""}, ranked</h1>
              <p className="page-subtitle">
                Activities, days out, and ways to spend a weekend {townLabel ? `near ${townLabel}` : ""}, ranked by locals.
              </p>

              <CategoryTabs active="/things-to-do" />
            </div>

            <div className="period-toggle">
              <button className="active">Today</button>
              <span>·</span>
              <button>This week</button>
              <span>·</span>
              <button>This month</button>
            </div>

            <Leaderboard category="things-to-do" town={town} />
          </div>

          <PageSidebar
            sponsor={{ type: "category", id: "things-to-do", label: CATEGORY_LABELS_CORE["things-to-do"] }}
            town={townLabel ? town : undefined}
          />
        </div>

        <div className="cta-band">
          <h3>think your business belongs on this list?</h3>
          <p>get listed for free, or buy a promoted slot to be seen today</p>
          <a className="btn btn-primary" href="/list-your-business">List your business</a>
        </div>
      </div>
    </>
  );
}
