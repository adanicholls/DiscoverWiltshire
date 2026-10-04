import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import CategoryTabs from "@/components/CategoryTabs";
import LocationFilter from "@/components/LocationFilter";
import SidebarEvents from "@/components/SidebarEvents";
import HomeSearchBar from "@/components/HomeSearchBar";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const town = typeof params.town === "string" ? params.town : undefined;

  return (
    <>
      <Header />

      <main className="wrap">
        <div className="masthead">
          <div className="masthead-brand">
            <h1 className="masthead-tagline">the friend who knows Wiltshire best</h1>
          </div>
        </div>

        {/* The "I need X, near me, now" fast lane - separate from the
            leaderboard below, not a replacement for it. Routes to a
            filtered results page rather than changing what's shown here. */}
        <HomeSearchBar />

        <CategoryTabs active="/" />

        <div className="home-layout">
          <div className="home-controls" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div className="period-toggle" style={{ paddingBottom: 0 }}>
              <button className="active">Today</button>
              <span>·</span>
              <button>This week</button>
              <span>·</span>
              <button>This month</button>
            </div>
            <LocationFilter />
          </div>

          <div className="home-main">
            <Leaderboard showCategoryTag limit={8} town={town} />
            <p className="placeholder-note">
              The time toggle above (Today / This week / This month) is still just visual — votes now carry real
              timestamps in the database, so filtering by period is just a query away, not yet wired up to these
              buttons.
            </p>
          </div>

          <aside className="home-sidebar">
            <SidebarEvents />
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
