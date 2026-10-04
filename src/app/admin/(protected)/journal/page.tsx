import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import RemoteImage from "@/components/RemoteImage";
import DeleteJournalButton from "@/components/admin/DeleteJournalButton";
import {
  JOURNAL_SUMMARY_COLUMNS,
  entryHref,
  formatJournalDate,
  mapJournalSummaryRow,
  statusLabel,
  type JournalStatus,
  type JournalSummaryRow,
} from "@/lib/journal";

export const metadata: Metadata = {
  title: "Journal — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

const STATUS_COLORS: Record<string, string> = {
  Published: "var(--green)",
  Scheduled: "var(--mustard-ink)",
  Draft: "var(--ink-muted)",
};

export default async function AdminJournalPage() {
  const supabase = createSupabaseAdminClient();
  // The admin client bypasses row-level security, so this includes drafts and
  // scheduled entries that the public site can't see.
  const { data, error } = await supabase
    .from("journal_entries")
    .select(`${JOURNAL_SUMMARY_COLUMNS}, status`)
    .order("published_at", { ascending: false });

  if (error) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        Couldn&apos;t load the journal: {error.message}
        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
          If this is the first time, the <code>0006_journal.sql</code> migration may not have been run in Supabase yet.
        </div>
      </div>
    );
  }

  const entries = ((data ?? []) as (JournalSummaryRow & { status: JournalStatus })[]).map((row) => ({
    ...mapJournalSummaryRow(row),
    status: row.status,
  }));

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 className="page-title" style={{ margin: "22px 0 6px" }}>
          journal
        </h1>
        <Link className="btn btn-primary" href="/admin/journal/new">
          + New entry
        </Link>
      </div>
      <p className="page-subtitle">
        Articles have their own page on the site; news items are cards that link out to another website. Drafts and
        scheduled entries are only visible here.
      </p>

      {entries.length === 0 ? (
        <div className="card" style={{ textAlign: "center", opacity: 0.65, marginBottom: 28 }}>
          Nothing here yet &mdash; write the first entry.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
          {entries.map((entry) => {
            const status = statusLabel(entry);
            const live = status === "Published";
            const viewHref = live ? entryHref(entry) : "";
            return (
              <div key={entry.id} className="card" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ position: "relative", width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "var(--surface-muted)" }}>
                  {entry.coverUrl && <RemoteImage src={entry.coverUrl} alt="" sizes="48px" />}
                </div>

                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{entry.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: STATUS_COLORS[status] }}>{status}</span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
                    {entry.type === "news" ? "News" : "Article"}
                    {entry.category ? ` · ${entry.category}` : ""} · {formatJournalDate(entry.publishedAt)}
                    {entry.authorName ? ` · ${entry.authorName}` : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {viewHref && (
                    <a
                      className="btn btn-secondary"
                      href={viewHref}
                      {...(entry.type === "news" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      View
                    </a>
                  )}
                  <Link className="btn btn-secondary" href={`/admin/journal/${entry.id}/edit`}>
                    Edit
                  </Link>
                  <DeleteJournalButton id={entry.id} title={entry.title} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
