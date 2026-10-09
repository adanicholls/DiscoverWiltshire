import type { Metadata } from "next";
import Leaderboard from "@/components/Leaderboard";
import PageSidebar from "@/components/PageSidebar";
import { CATEGORY_LABELS_CORE, TOWN_LABELS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shops in Wiltshire, ranked — Discover Wiltshire",
};

export default async function ShopsPage({ searchParams }: PageProps<"/shops">) {
  const params = await searchParams;
  const town = typeof params.town === "string" ? params.town : undefined;
  const townLabel = town ? TOWN_LABELS[town] : undefined;

  return (
    <>
      <div className="wrap">
        <div className="home-layout home-layout--single-row home-layout--titled">
          <div className="home-main">
            <div className="page-head">
              <h1 className="page-title">Shops{townLabel ? ` near ${townLabel}` : ""}, ranked</h1>
              <p className="page-subtitle">
                Local shops and services worth knowing about {townLabel ? `near ${townLabel}` : ""}, ranked by the people
                who use them.
              </p>
            </div>

            <div className="period-toggle">
              <button className="active">Today</button>
              <span>·</span>
              <button>This week</button>
              <span>·</span>
              <button>This month</button>
            </div>

            <Leaderboard category="shops" town={town} />
          </div>

          <PageSidebar
            sponsor={{ type: "category", id: "shops", label: CATEGORY_LABELS_CORE.shops }}
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
