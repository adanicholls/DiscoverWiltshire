// Turns the admin journal form (a FormData) into a validated entry, or a
// message the admin can act on. Pure - no database or Next imports - so every
// rule here can be tested with plain node; the server action just calls this
// and then does the uploads and the save.

import { slugifyBase } from "./slug";
import { normalizeWebsite } from "./sponsors";
import {
  JOURNAL_IMAGE_MAX_BYTES,
  JOURNAL_IMAGE_TYPES,
  type JournalEntryType,
  type JournalStatus,
} from "./journal";

export const MAX_TITLE = 200;
export const MAX_CATEGORY = 40;
export const MAX_EXCERPT = 300;
export const MAX_AUTHOR = 80;
export const MAX_BODY = 100_000;
export const MAX_SLUG = 80;
export const MAX_CTA = 30;

export interface ParsedJournalRow {
  entry_type: JournalEntryType;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  author_name: string;
  external_url: string;
  cta_label: string;
  status: JournalStatus;
  published_at: string;
}

export interface ParsedJournalForm {
  /** Empty when creating a new entry. */
  id: string;
  row: ParsedJournalRow;
  /** The address the admin asked for (articles), already cleaned up. Empty for news. */
  slug: string;
  /** News items get an address made from their headline; the server adds a
   * short random suffix so two similar headlines never collide. */
  slugFromTitle: string;
  cover: File | null;
  removeCover: boolean;
}

export type ParseJournalResult = { ok: true; value: ParsedJournalForm } | { ok: false; error: string };

export function validateImageFile(file: File): string | null {
  if (!JOURNAL_IMAGE_TYPES.includes(file.type)) return "The image must be a PNG, JPG, WebP or GIF";
  if (file.size > JOURNAL_IMAGE_MAX_BYTES) return "The image is too big - 3MB is the most it can be";
  return null;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function cutSlug(slug: string, max: number): string {
  return slug.slice(0, max).replace(/-+$/, "");
}

export function parseJournalForm(formData: FormData, now = new Date()): ParseJournalResult {
  const fail = (error: string): ParseJournalResult => ({ ok: false, error });

  const type = text(formData, "entry_type");
  if (type !== "article" && type !== "news") return fail("Choose whether this is an article or a news item");

  const title = text(formData, "title").trim();
  if (!title) return fail("Enter a title");
  if (title.length > MAX_TITLE) return fail(`The title is too long (${MAX_TITLE} characters max)`);

  const category = text(formData, "category").replace(/\s+/g, " ").trim();
  if (category.length > MAX_CATEGORY) return fail(`The category is too long (${MAX_CATEGORY} characters max)`);

  const excerpt = text(formData, "excerpt").trim();
  if (excerpt.length > MAX_EXCERPT) return fail(`The summary is too long (${MAX_EXCERPT} characters max)`);

  const author = text(formData, "author_name").trim();
  if (author.length > MAX_AUTHOR) return fail(`The author name is too long (${MAX_AUTHOR} characters max)`);

  const status = text(formData, "status");
  if (status !== "draft" && status !== "published") return fail("Choose Draft or Published");

  let publishedAt = now.toISOString();
  const dateInput = text(formData, "published_at").trim();
  if (dateInput) {
    const parsed = new Date(dateInput);
    if (Number.isNaN(parsed.getTime())) return fail("That publish date doesn't look right");
    publishedAt = parsed.toISOString();
  }

  let slug = "";
  let body = "";
  let externalUrl = "";
  let ctaLabel = "Read article";

  if (type === "article") {
    slug = cutSlug(slugifyBase(text(formData, "slug")) || slugifyBase(title), MAX_SLUG);
    if (!slug) return fail("Add a web address (slug) - the title has no letters or numbers to make one from");

    body = text(formData, "body");
    if (body.length > MAX_BODY) return fail("The article is too long");
    if (status === "published" && !body.trim()) return fail("Write something in the article before publishing it");
  } else {
    try {
      externalUrl = normalizeWebsite(text(formData, "external_url"));
    } catch (err) {
      return fail(err instanceof Error ? err.message : "That link doesn't look right");
    }
    if (!externalUrl) return fail("A news item needs a link to send readers to");

    const label = text(formData, "cta_label").trim();
    if (label.length > MAX_CTA) return fail(`The button text is too long (${MAX_CTA} characters max)`);
    if (label) ctaLabel = label;
  }

  let cover: File | null = null;
  const file = formData.get("cover");
  if (typeof file === "object" && file !== null && "size" in file && file.size > 0) {
    const problem = validateImageFile(file as File);
    if (problem) return fail(problem);
    cover = file as File;
  }

  return {
    ok: true,
    value: {
      id: text(formData, "id"),
      row: {
        entry_type: type,
        title,
        category,
        excerpt,
        body,
        author_name: author,
        external_url: externalUrl,
        cta_label: ctaLabel,
        status,
        published_at: publishedAt,
      },
      slug,
      slugFromTitle: cutSlug(slugifyBase(title), 60) || "news",
      cover,
      removeCover: text(formData, "remove_cover") === "on",
    },
  };
}
