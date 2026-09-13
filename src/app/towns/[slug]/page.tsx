import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TownChips from "@/components/TownChips";
import Leaderboard from "@/components/Leaderboard";
import { TOWNS, TOWN_LABELS } from "@/lib/data";

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

export default async function TownPage({ params }: PageProps<"/towns/[slug]">) {
  const { slug } = await params;
  const label = TOWN_LABELS[slug];

  if (!label) {
    return (
      <>
        <Header />
        <main className="wrap">
          <h1 className="page-title">Town not found</h1>
          <p className="page-subtitle">
            That town isn&apos;t on Discover Wiltshire yet. <Link href="/towns">See all towns</Link>.
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
        <p className="page-subtitle">
          Every pub, stay, activity, shop, and local trade near {label}, ranked by the people who actually use them.
        </p>

        <TownChips activeSlug={slug} />

        <Leaderboard town={slug} showCategoryTag />

        <div className="cta-band">
          <h3>think your business belongs on this list?</h3>
          <p>get listed for free, or buy a promoted slot to be seen today</p>
          <a className="btn btn-primary" href="/list-your-business">
            List your business
          </a>
        </div>
      </main>

      <Footer />
    </>
  );
}
