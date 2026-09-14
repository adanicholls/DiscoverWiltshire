import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TradeChips from "@/components/TradeChips";
import Leaderboard from "@/components/Leaderboard";
import { Store } from "@/lib/store";
import { TOWN_LABELS } from "@/lib/data";

// One generic page serves every trade category via /trades/<slug>, instead
// of a hand-built page per category. Categories are admin-editable (see
// /admin/categories) so they're fetched from Supabase rather than a static
// list — generateStaticParams only pre-renders whatever exists at build
// time; a category added afterwards still works immediately because Next's
// default dynamicParams behaviour renders unlisted slugs on request, and
// the validity/label lookup below queries Supabase directly rather than a
// hardcoded array.
export async function generateStaticParams() {
  const tradeCategories = await Store.getTradeCategories();
  return tradeCategories.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/trades/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tradeCategories = await Store.getTradeCategories();
  const label = tradeCategories.find((c) => c.id === slug)?.label;
  return { title: label ? `${label} in Wiltshire, ranked — Discover Wiltshire` : "Category not found" };
}

export default async function TradeCategoryPage({ params, searchParams }: PageProps<"/trades/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const town = typeof sp.town === "string" ? sp.town : undefined;
  const townLabel = town ? TOWN_LABELS[town] : undefined;
  const tradeCategories = await Store.getTradeCategories();
  const label = tradeCategories.find((c) => c.id === slug)?.label;

  if (!label) {
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
        <h1 className="page-title">
          {label}
          {townLabel ? ` near ${townLabel}` : ""}, ranked
        </h1>
        <p className="page-subtitle">
          {label} {townLabel ? `near ${townLabel}` : "across Wiltshire"}, ranked by the people who&apos;ve actually
          hired them.
        </p>

        <TradeChips activeSlug={slug} />

        <div className="period-toggle">
          <button className="active">Today</button>
          <span>·</span>
          <button>This week</button>
          <span>·</span>
          <button>This month</button>
        </div>

        <Leaderboard category={slug} town={town} />

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
