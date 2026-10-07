import type { Metadata } from "next";
import Leaderboard from "@/components/Leaderboard";
import PageSidebar from "@/components/PageSidebar";
import { CATEGORY_LABELS_CORE, TOWN_LABELS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Stay in Wiltshire, ranked — Discover Wiltshire",
};

export default async function StayPage({ searchParams }: PageProps<"/stay">) {
  const params = await searchParams;
  const town = typeof params.town === "string" ? params.town : undefined;
  const townLabel = town ? TOWN_LABELS[town] : undefined;

  return (
    <>
      <div className="wrap">
        <div className="home-layout home-layout--single-row home-layout--titled">
          <div className="home-main">
            <div className="page-head">
              <h1 className="page-title">Stay{townLabel ? ` near ${townLabel}` : ""}, ranked</h1>
              <p className="page-subtitle">
                B&amp;Bs, cottages, and places to sleep {townLabel ? `near ${townLabel}` : ""}, ranked by the people
                who&apos;ve stayed there.
              </p>
            </div>

            <div className="period-toggle">
              <button className="active">Today</button>
              <span>·</span>
              <button>This week</button>
              <span>·</span>
              <button>This month</button>
            </div>

            <Leaderboard category="stay" town={town} />
          </div>

          <PageSidebar
            sponsor={{ type: "category", id: "stay", label: CATEGORY_LABELS_CORE.stay }}
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
