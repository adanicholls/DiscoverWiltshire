import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import CategoryTabs from "@/components/CategoryTabs";
import LocationFilter from "@/components/LocationFilter";
import EventsList from "@/components/EventsList";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const town = typeof params.town === "string" ? params.town : undefined;

  return (
    <>
      <Header />

      <main className="wrap">
        <div className="masthead">
          <div className="masthead-brand">
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="17" fill="none" stroke="#C1502E" strokeWidth="1.5" />
              <path
                d="M20 13v14M15 17l5 3 5-3M14 22l6 3 6-3"
                stroke="#4B6B3A"
                strokeWidth="1.3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <div className="masthead-tagline">the friend who knows Wiltshire best</div>
          </div>
        </div>

        <CategoryTabs active="/" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div className="period-toggle" style={{ paddingBottom: 0 }}>
            <button className="active">Today</button>
            <span>·</span>
            <button>This week</button>
            <span>·</span>
            <button>This month</button>
          </div>
          <LocationFilter />
        </div>

        <div className="home-layout">
          <div className="home-main">
            <Leaderboard showCategoryTag limit={8} searchQuery={q} town={town} />
            <p className="placeholder-note">
              The time toggle above (Today / This week / This month) is still just visual — votes now carry real
              timestamps in the database, so filtering by period is just a query away, not yet wired up to these
              buttons.
            </p>
          </div>

          <aside className="home-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-card-header">
                <h2 className="section-heading">what&apos;s on</h2>
                <Link href="/whats-on">See all →</Link>
              </div>
              <EventsList />
            </div>
          </aside>
        </div>

        <div className="cta-band">
          <h3>own a business in Wiltshire?</h3>
          <p>get discovered by the people already looking for you</p>
          <a className="btn btn-primary" href="/list-your-business">List your business</a>
        </div>
      </main>

      <Footer />
    </>
  );
}
