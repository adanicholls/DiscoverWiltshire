import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryTabs from "@/components/CategoryTabs";
import TradeChips from "@/components/TradeChips";
import Leaderboard from "@/components/Leaderboard";
import { CATEGORY_LABELS, TRADE_CATEGORIES } from "@/lib/data";

// One generic page serves every trade category via /trades/<slug>, instead
// of a hand-built page per category — see TRADE_CATEGORIES in lib/data.ts.
// Pre-rendering all known slugs at build time keeps them fast without
// needing anything dynamic in the URL structure itself.
export function generateStaticParams() {
  return TRADE_CATEGORIES.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/trades/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const label = CATEGORY_LABELS[slug];
  return { title: label ? `${label} in Wiltshire, ranked — Discover Wiltshire` : "Category not found" };
}

export default async function TradeCategoryPage({ params }: PageProps<"/trades/[slug]">) {
  const { slug } = await params;
  const isTrade = TRADE_CATEGORIES.some((c) => c.id === slug);
  const label = CATEGORY_LABELS[slug];

  if (!isTrade) {
    return (
      <>
        <Header />
        <main className="wrap">
          <h1 className="page-title">Category not found</h1>
          <p className="page-subtitle">
            That trade or service category doesn&apos;t exist. <Link href="/trades">See all trades &amp; services</Link>.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="wrap">
        <h1 className="page-title">{label}, ranked</h1>
        <p className="page-subtitle">{label} across Wiltshire, ranked by the people who&apos;ve actually hired them.</p>

        <CategoryTabs active="/trades" />
        <TradeChips activeSlug={slug} />

        <div className="period-toggle">
          <button className="active">Today</button>
          <span>·</span>
          <button>This week</button>
          <span>·</span>
          <button>This month</button>
        </div>

        <Leaderboard category={slug} />

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
