import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import JournalEntryForm from "@/components/admin/JournalEntryForm";
import { JOURNAL_ENTRY_COLUMNS, entryHref, isLive, mapJournalEntryRow, type JournalEntryRow } from "@/lib/journal";

export const metadata: Metadata = {
  title: "Edit journal entry — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

export default async function AdminEditJournalEntryPage({ params }: PageProps<"/admin/journal/[id]/edit">) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const [{ data: row, error }, { data: categoryRows }] = await Promise.all([
    supabase.from("journal_entries").select(JOURNAL_ENTRY_COLUMNS).eq("id", id).maybeSingle(),
    supabase.from("journal_entries").select("category"),
  ]);

  if (error || !row) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        Couldn&apos;t find that entry. <Link href="/admin/journal">Back to the journal</Link>.
      </div>
    );
  }

  const entry = mapJournalEntryRow(row as JournalEntryRow);
  const categories = [...new Set((categoryRows ?? []).map((r) => r.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  const viewHref = isLive(entry) ? entryHref(entry) : "";

  return (
    <>
      <Link className="breadcrumb" href="/admin/journal">
        ← Journal
      </Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 className="page-title" style={{ margin: "22px 0 6px" }}>
          {entry.title}
        </h1>
        {viewHref && (
          <a
            className="btn btn-secondary"
            href={viewHref}
            {...(entry.type === "news" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            View on site
          </a>
        )}
      </div>

      <JournalEntryForm
        categories={categories}
        initial={{
          id: entry.id,
          type: entry.type,
          title: entry.title,
          slug: entry.slug,
          category: entry.category,
          excerpt: entry.excerpt,
          body: entry.body,
          coverUrl: entry.coverUrl,
          authorName: entry.authorName,
          externalUrl: entry.externalUrl,
          ctaLabel: entry.ctaLabel,
          status: entry.status,
          publishedAt: entry.publishedAt,
        }}
      />
    </>
  );
}
