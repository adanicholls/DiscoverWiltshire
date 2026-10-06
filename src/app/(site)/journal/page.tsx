import type { Metadata } from "next";
import JournalArchive from "@/components/journal/JournalArchive";
import { Store } from "@/lib/store";
import { buildCategoryOptions, filterFromParams } from "@/lib/journal";
import "@/components/journal/journal.css";

export const metadata: Metadata = {
  title: "Journal — Discover Wiltshire",
  description: "Stories, guides and local news from around Wiltshire.",
};

export default async function JournalPage({ searchParams }: PageProps<"/journal">) {
  const params = await searchParams;
  const entries = await Store.getJournalEntries();

  // A shared link like /journal?category=guides opens already filtered; an
  // unknown category just shows everything.
  const filter = filterFromParams(
    {
      category: typeof params.category === "string" ? params.category : undefined,
      type: typeof params.type === "string" ? params.type : undefined,
    },
    buildCategoryOptions(entries),
    entries.some((e) => e.type === "news")
  );

  return (
    <>
      <div className="wrap" style={{ paddingBottom: 72 }}>
        <h1 className="journal-intro">Stories, guides and local news from around Wiltshire.</h1>
        <JournalArchive entries={entries} initialFilter={filter} />
      </div>
    </>
  );
}
