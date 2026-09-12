import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import CategoryTabs from "@/components/CategoryTabs";
import { EVENTS } from "@/lib/data";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;

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
        <div className="period-toggle">
          <button className="active">Today</button>
          <span>·</span>
          <button>This week</button>
          <span>·</span>
          <button>This month</button>
        </div>

        <Leaderboard showCategoryTag limit={8} searchQuery={q} />
        <p className="placeholder-note">
          The time toggle above (Today / This week / This month) is still just visual — votes now carry real
          timestamps in the database, so filtering by period is just a query away, not yet wired up to these buttons.
        </p>

        <h2 className="section-heading">what&apos;s on this week</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
          {EVENTS.map((ev) => (
            <div className="card" key={ev.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>{ev.name}</span>
              <span style={{ opacity: 0.6 }}>{ev.when}</span>
            </div>
          ))}
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
