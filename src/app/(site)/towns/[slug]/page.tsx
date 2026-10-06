import type { Metadata } from "next";
import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";
import PageSidebar from "@/components/PageSidebar";
import { TOWNS, TOWN_LABELS, DIRECT_CATEGORY_PAGES } from "@/lib/data";
import { Store } from "@/lib/store";

// The ranked sections load client-side, but the sidebar (this town's sponsor
// and its events) is rendered on the server - so without this the page would
// freeze whatever existed at build time, including events that have since
// passed. Five minutes bounds that for time-based changes; the event and
// sponsor admin actions also revalidate this route on demand so a change
// appears immediately.
export const revalidate = 300;

// One generic page serves every town via /towns/<slug>, same pattern as
// /trades/[slug] - see TOWNS in lib/data.ts to add more.
export function generateStaticParams() {
  return TOWNS.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/towns/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const label = TOWN_LABELS[slug];
  return { title: label ? `${label}, Wiltshire — Discover Wiltshire` : "Town not found" };
}

// "Show me the best of my town" is its own browsing entry point, distinct
// from category leaderboards and from search - sectioned by category
// (same ranking mechanic, just scoped by geography) rather than one mixed
// list, so it reads like a set of local shortlists rather than a dump.
const CORE_SECTION_HEADINGS: Record<string, (label: string) => string> = {
  "eat-drink": (label) => `Top-rated eat & drink in ${label}`,
  stay: (label) => `Top-rated places to stay in ${label}`,
  "things-to-do": (label) => `Top things to do in ${label}`,
  shops: (label) => `Top-rated shops in ${label}`,
};

export default async function TownPage({ params }: PageProps<"/towns/[slug]">) {
  const { slug } = await params;
  const label = TOWN_LABELS[slug];

  if (!label) {
    return (
      <>
        <div className="wrap">
          <h1 className="page-title">Town not found</h1>
          <p className="page-subtitle">
            That town isn&apos;t on Discover Wiltshire yet. <Link href="/towns">See all towns</Link>.
          </p>
        </div>
      </>
    );
  }

  const tradeCategories = await Store.getTradeCategories();

  return (
    <>
      <div className="wrap">
        <h1 className="page-title">{label}, ranked</h1>
        <p className="page-subtitle">
          Every pub, stay, activity, shop, and local trade near {label}, ranked by the people who actually use them.
        </p>

        {/* Same two-column shape as the homepage: the ranked sections on the
            left, this town's sponsor and upcoming events in a sidebar on the
            right (stacking below on narrow screens, sponsor first). */}
        <div className="home-layout home-layout--single-row">
          <div className="home-main">
            {DIRECT_CATEGORY_PAGES.map((catId) => (
              <section key={catId} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <h2 className="section-heading">{CORE_SECTION_HEADINGS[catId](label)}</h2>
                  <Link href={`/${catId}?town=${slug}`} style={{ fontSize: 12, opacity: 0.65, whiteSpace: "nowrap" }}>
                    See all →
                  </Link>
                </div>
                <Leaderboard category={catId} town={slug} limit={5} />
              </section>
            ))}

            <section style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <h2 className="section-heading">Top-rated trades &amp; services in {label}</h2>
                <Link href={`/trades?town=${slug}`} style={{ fontSize: 12, opacity: 0.65, whiteSpace: "nowrap" }}>
                  See all →
                </Link>
              </div>
              <Leaderboard categories={tradeCategories.map((c) => c.id)} town={slug} limit={5} showCategoryTag />
            </section>
          </div>

          <PageSidebar sponsor={{ type: "town", id: slug, label }} town={slug} />
        </div>

        <div className="cta-band">
          <h3>think your business belongs on this list?</h3>
          <p>get listed for free, or buy a promoted slot to be seen today</p>
          <a className="btn btn-primary" href="/list-your-business">
            List your business
          </a>
        </div>
      </div>
    </>
  );
}
