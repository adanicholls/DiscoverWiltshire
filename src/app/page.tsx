import type { Metadata } from "next";
import HomeHeader from "@/components/home/HomeHeader";
import HomeSidebar from "@/components/home/HomeSidebar";
import HeroBanner from "@/components/home/HeroBanner";
import HomeFeed from "@/components/home/HomeFeed";
import HomeFooter from "@/components/home/HomeFooter";
import { Store, type LiveEvent } from "@/lib/store";
import type { JournalSummary } from "@/lib/journal";
import "@/components/home/home.css";

export const metadata: Metadata = {
  title: "Discover Wiltshire — the county's favourites, ranked by the people who live here",
};

// The homepage has its own shell, modelled on producthunt.com's: a fixed top
// bar, a left sidebar of links with "Trending" (the Journal) and "Upcoming
// events" beneath, and the ranked feed in a rounded panel. Every other page
// keeps the standard top navigation.
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const town = typeof params.town === "string" ? params.town : undefined;

  // Sidebar extras are nice-to-have: a failed lookup leaves that block
  // empty rather than taking the homepage down.
  let events: LiveEvent[] = [];
  try {
    events = await Store.getUpcomingEvents(3);
  } catch (err) {
    console.error("Failed to load events:", err);
  }
  const journal: JournalSummary[] = await Store.getJournalEntries(4);

  return (
    <div className="ph-home">
      <HomeHeader />
      <div className="ph-body">
        <HomeSidebar journal={journal} events={events} />
        <main className="ph-main">
          <HeroBanner />
          <HomeFeed town={town} />
        </main>
      </div>
      <HomeFooter />
    </div>
  );
}
