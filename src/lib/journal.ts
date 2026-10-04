// Shared, dependency-free helpers for the Journal (/journal): types, mapping
// database rows to them, and the small bits of logic the public pages, the
// cards and the admin all need to agree on (tags, filters, dates, links).
// Kept free of Supabase/Next imports so it can run anywhere - and be tested
// with plain node.

import { slugifyBase } from "./slug";

export const JOURNAL_IMAGE_BUCKET = "journal-images";
export const JOURNAL_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const JOURNAL_IMAGE_MAX_BYTES = 3 * 1024 * 1024;
export const JOURNAL_IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** The object path inside the journal-images bucket for one of its public
 * URLs (".../object/public/journal-images/abc.png" -> "abc.png"), or null if
 * the URL isn't from this bucket. Used to delete a replaced/removed image. */
export function journalImagePath(publicUrl: string): string | null {
  const marker = `/object/public/${JOURNAL_IMAGE_BUCKET}/`;
  const at = publicUrl.indexOf(marker);
  if (at === -1) return null;
  const path = decodeURIComponent(publicUrl.slice(at + marker.length).split("?")[0]);
  return path || null;
}

/** Cards shown per "page" on /journal - the Load more button reveals this many more. */
export const JOURNAL_PAGE_SIZE = 12;

export type JournalEntryType = "article" | "news";
export type JournalStatus = "draft" | "published";

/** What a card on the index needs. */
export interface JournalSummary {
  id: string;
  slug: string;
  type: JournalEntryType;
  title: string;
  category: string;
  coverUrl: string;
  authorName: string;
  externalUrl: string;
  ctaLabel: string;
  publishedAt: string;
}

/** A full entry, for its own page or the admin editor. */
export interface JournalEntry extends JournalSummary {
  excerpt: string;
  body: string;
  status: JournalStatus;
}

export interface JournalSummaryRow {
  id: string;
  slug: string;
  entry_type: JournalEntryType;
  title: string;
  category: string;
  cover_url: string;
  author_name: string;
  external_url: string;
  cta_label: string;
  published_at: string;
}

export interface JournalEntryRow extends JournalSummaryRow {
  excerpt: string;
  body: string;
  status: JournalStatus;
}

export const JOURNAL_SUMMARY_COLUMNS =
  "id, slug, entry_type, title, category, cover_url, author_name, external_url, cta_label, published_at";
export const JOURNAL_ENTRY_COLUMNS = `${JOURNAL_SUMMARY_COLUMNS}, excerpt, body, status`;

export function mapJournalSummaryRow(row: JournalSummaryRow): JournalSummary {
  return {
    id: row.id,
    slug: row.slug,
    type: row.entry_type,
    title: row.title,
    category: row.category,
    coverUrl: row.cover_url,
    authorName: row.author_name,
    externalUrl: row.external_url,
    ctaLabel: row.cta_label,
    publishedAt: row.published_at,
  };
}

export function mapJournalEntryRow(row: JournalEntryRow): JournalEntry {
  return { ...mapJournalSummaryRow(row), excerpt: row.excerpt, body: row.body, status: row.status };
}

/** Where a card leads: an article's own page, or a news item's outside link
 * ("" if a news item somehow has no link - the card then isn't clickable). */
export function entryHref(entry: Pick<JournalSummary, "type" | "slug" | "externalUrl">): string {
  if (entry.type === "news") return /^https?:\/\//i.test(entry.externalUrl) ? entry.externalUrl : "";
  return `/journal/${entry.slug}`;
}

export function entryIsExternal(entry: Pick<JournalSummary, "type">): boolean {
  return entry.type === "news";
}

/** The small pills under a card's image: its category (if it has one), then
 * what kind of entry it is. */
export function entryTags(entry: Pick<JournalSummary, "type" | "category">): string[] {
  const kind = entry.type === "news" ? "News" : "Journal";
  return entry.category ? [entry.category, kind] : [kind];
}

export function ctaText(entry: Pick<JournalSummary, "ctaLabel">): string {
  return entry.ctaLabel.trim() || "Read article";
}

// --- Filtering ------------------------------------------------------------

export type JournalFilter = { kind: "all" } | { kind: "category"; slug: string } | { kind: "news" };

export interface JournalCategoryOption {
  slug: string;
  label: string;
}

export function categorySlug(category: string): string {
  return slugifyBase(category);
}

/** The category pills: every category in use, A-Z, de-duplicated ignoring
 * case and punctuation ("Local news" and "local-news" are one pill). */
export function buildCategoryOptions(entries: Pick<JournalSummary, "category">[]): JournalCategoryOption[] {
  const bySlug = new Map<string, string>();
  for (const e of entries) {
    const label = e.category.trim();
    const slug = categorySlug(label);
    if (slug && !bySlug.has(slug)) bySlug.set(slug, label);
  }
  return [...bySlug.entries()]
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "en", { sensitivity: "base" }));
}

export function filterEntries<T extends Pick<JournalSummary, "type" | "category">>(
  entries: T[],
  filter: JournalFilter
): T[] {
  if (filter.kind === "news") return entries.filter((e) => e.type === "news");
  if (filter.kind === "category") return entries.filter((e) => categorySlug(e.category) === filter.slug);
  return entries;
}

/** Reads ?category= / ?type= from a URL into a filter, ignoring anything
 * that doesn't match a real pill so a stale link just shows everything. */
export function filterFromParams(
  params: { category?: string; type?: string },
  options: JournalCategoryOption[],
  hasNews: boolean
): JournalFilter {
  if (params.type === "news" && hasNews) return { kind: "news" };
  if (params.category && options.some((o) => o.slug === params.category)) {
    return { kind: "category", slug: params.category };
  }
  return { kind: "all" };
}

// --- Dates ----------------------------------------------------------------

/** "12.08.2026" - day.month.year, in UK time wherever the page renders. */
export function formatJournalDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/London",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")}`;
}

/** An entry is live when it's published and its date has arrived. */
export function isLive(entry: { status: JournalStatus; publishedAt: string }, now = Date.now()): boolean {
  return entry.status === "published" && new Date(entry.publishedAt).getTime() <= now;
}

/** For the admin list: Draft, Scheduled (published but dated in the future), or Published. */
export function statusLabel(entry: { status: JournalStatus; publishedAt: string }, now = Date.now()): string {
  if (entry.status === "draft") return "Draft";
  return new Date(entry.publishedAt).getTime() > now ? "Scheduled" : "Published";
}
