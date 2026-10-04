import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RemoteImage from "@/components/RemoteImage";
import JournalBody from "@/components/journal/JournalBody";
import JournalCard from "@/components/journal/JournalCard";
import ShareButtons from "@/components/journal/ShareButtons";
import { Store } from "@/lib/store";
import { categorySlug, entryHref, formatJournalDate } from "@/lib/journal";
import "@/components/journal/journal.css";

// Entries change when someone edits them in the admin (which revalidates this
// route straight away) or when a scheduled one comes due - five minutes
// bounds that second case.
export const revalidate = 300;

// Both generateMetadata and the page need the entry; cache() makes that one query.
const getEntry = cache((slug: string) => Store.getJournalEntryBySlug(slug));

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry) return { title: "Journal — Discover Wiltshire" };

  return {
    title: `${entry.title} — Discover Wiltshire`,
    description: entry.excerpt || undefined,
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.excerpt || undefined,
      publishedTime: entry.publishedAt,
      images: entry.coverUrl ? [entry.coverUrl] : undefined,
    },
  };
}

export default async function JournalEntryPage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry) notFound();

  // News items have no page of their own - their card links straight out, so
  // someone arriving at the address directly is sent the same way.
  if (entry.type === "news") {
    const href = entryHref(entry);
    if (href) redirect(href);
    notFound();
  }

  const recent = await Store.getJournalEntries(5);
  const related = recent.filter((e) => e.id !== entry.id).slice(0, 4);

  return (
    <>
      <Header />

      <main className="wrap journal-entry">
        <article className="journal-entry__grid">
          <div className="journal-entry__hero">
            <nav className="journal-entry__crumbs" aria-label="Breadcrumb">
              <Link href="/journal" className="journal-entry__back">
                ← Back to journal
              </Link>
              {entry.category && <Link href={`/journal?category=${categorySlug(entry.category)}`}>{entry.category}</Link>}
            </nav>

            <h1 className="journal-entry__title">{entry.title}</h1>

            <div className="journal-entry__info">
              {entry.authorName && <span className="journal-entry__author">By {entry.authorName}</span>}
              <time dateTime={entry.publishedAt}>{formatJournalDate(entry.publishedAt)}</time>
            </div>

            <ShareButtons title={entry.title} />
          </div>

          <div className="journal-entry__main">
            {entry.coverUrl && (
              <div className="journal-entry__cover">
                <RemoteImage src={entry.coverUrl} alt={entry.title} sizes="(max-width: 860px) 100vw, 520px" priority />
              </div>
            )}
            <JournalBody markdown={entry.body} />
          </div>
        </article>
      </main>

      {related.length > 0 && (
        <section className="wrap journal-related" aria-labelledby="journal-related-title">
          <div className="journal-related__head">
            <h2 id="journal-related-title" className="journal-related__title">
              More from the journal
            </h2>
            <Link href="/journal" className="btn btn-secondary">
              See all journal
            </Link>
          </div>
          <div className="journal-grid">
            {related.map((e) => (
              <JournalCard key={e.id} entry={e} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
