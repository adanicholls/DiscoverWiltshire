import HomeHeader from "@/components/home/HomeHeader";
import HomeSidebar from "@/components/home/HomeSidebar";
import HomeFooter from "@/components/home/HomeFooter";
import { Store, type LiveEvent } from "@/lib/store";
import type { JournalSummary } from "@/lib/journal";
import "@/components/home/home.css";

// The sidebar's "upcoming events" and Journal blocks are shared by every
// public page, so statically-built pages (pricing, towns...) refresh them
// every few minutes rather than freezing whatever existed at build time.
export const revalidate = 300;

// The shell every public page sits in, modelled on producthunt.com: a fixed
// top bar, a left sidebar of links (with the latest Journal entries and
// upcoming events beneath), and the page itself in a rounded dark panel.
// The admin area has its own, plainer layout.
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  // Sidebar extras are nice-to-have: a failed lookup leaves that block
  // empty rather than taking the page down.
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
        <main className="ph-main">{children}</main>
      </div>
      <HomeFooter />
    </div>
  );
}
