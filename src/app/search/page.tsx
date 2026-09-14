import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import HomeSearchBar from "@/components/HomeSearchBar";
import { Store } from "@/lib/store";
import { DIRECT_CATEGORY_PAGES, TOWN_LABELS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search — Discover Wiltshire",
  // The real, canonical pages for a trade/category are /eat-drink,
  // /trades/electricians, etc. (which this page redirects to whenever the
  // query resolves to one) - this page only renders for genuine free-text
  // queries, so it's not worth indexing as its own destination.
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const town = typeof params.town === "string" ? params.town : "";
  const townLabel = town ? TOWN_LABELS[town] : undefined;

  if (q) {
    // Search results, category leaderboards, and town-hub leaderboards all
    // read from the same ranked data - so a query that names a real
    // category (exactly, or closely enough) sends the visitor straight to
    // that category's actual leaderboard page instead of a separate
    // "search results" view, carrying the town filter across with it.
    const categoryLabels = await Store.getCategoryLabels();
    const needle = q.toLowerCase();
    const matchedId =
      Object.entries(categoryLabels).find(([, label]) => label.toLowerCase() === needle)?.[0] ??
      Object.entries(categoryLabels).find(
        ([, label]) => label.toLowerCase().includes(needle) || needle.includes(label.toLowerCase())
      )?.[0];

    if (matchedId) {
      const base = DIRECT_CATEGORY_PAGES.includes(matchedId) ? `/${matchedId}` : `/trades/${matchedId}`;
      redirect(town ? `${base}?town=${town}` : base);
    }
  }

  return (
    <>
      <Header />
      <main className="wrap">
        <h1 className="page-title">
          {q ? `"${q}"` : "search"}
          {townLabel ? ` near ${townLabel}` : ""}
        </h1>
        <p className="page-subtitle">
          {q
            ? "That didn't match a category exactly, so here's everything on Discover Wiltshire that mentions it."
            : "Search for a trade, service, or business by name."}
        </p>

        <HomeSearchBar initialQuery={q} initialTown={town} />

        {q && <Leaderboard searchQuery={q} town={town || undefined} showCategoryTag />}
      </main>
      <Footer />
    </>
  );
}
