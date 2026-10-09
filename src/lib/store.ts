/* ---------------------------------------------------
   Discover Wiltshire — data store
   Real Supabase-backed replacement for the old localStorage shim.
   Function shapes are similar to before, but every business/vote
   operation is now async (a network request) instead of a synchronous
   localStorage read. The only thing still kept client-side is which
   businesses *this browser* has voted for, purely for instant button
   feedback — the server enforces the real one-vote-per-visitor rule via
   a unique constraint on (business_id, voter_id), using a random id
   this browser generates once and keeps in localStorage.
--------------------------------------------------- */

import { supabase } from "./supabase";
import { CATEGORY_LABELS_CORE, type Business, type Testimonial, type TradeCategory } from "./data";
import {
  JOURNAL_ENTRY_COLUMNS,
  JOURNAL_SUMMARY_COLUMNS,
  mapJournalEntryRow,
  mapJournalSummaryRow,
  type JournalEntry,
  type JournalEntryRow,
  type JournalSummary,
  type JournalSummaryRow,
} from "./journal";

import { REVIEW_COLUMNS, mapReviewRow, type Review, type ReviewRow, type ReviewStats } from "./members";

export interface LiveBusiness extends Business {
  liveVotes: number;
}

const VOTER_ID_KEY = "dw_voter_id";
const VOTED_IDS_KEY = "dw_voted_ids";

function getVoterId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(VOTER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(VOTER_ID_KEY, id);
  }
  return id;
}

function getVotedIdsLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VOTED_IDS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function rememberVotedLocal(businessId: string) {
  if (typeof window === "undefined") return;
  const ids = getVotedIdsLocal();
  if (!ids.includes(businessId)) {
    ids.push(businessId);
    window.localStorage.setItem(VOTED_IDS_KEY, JSON.stringify(ids));
  }
}

// Row shapes as they come back from Postgres (snake_case) before mapping
// to the app's existing camelCase Business type.
interface BusinessRow {
  id: string;
  name: string;
  category_id: string;
  tagline: string;
  description: string;
  location: string;
  town_id: string | null;
  price_range: string;
  phone: string;
  website: string;
  photo_color: string;
  promoted: boolean;
  featured: boolean;
  founding_member: boolean;
}

function mapBusinessRow(row: BusinessRow): Omit<Business, "votes" | "testimonials"> {
  return {
    id: row.id,
    name: row.name,
    category: row.category_id,
    tagline: row.tagline,
    description: row.description,
    location: row.location,
    town: row.town_id,
    priceRange: row.price_range,
    phone: row.phone,
    website: row.website,
    photoColor: row.photo_color,
    promoted: row.promoted,
    featured: row.featured,
    foundingMember: row.founding_member,
  };
}

export interface LiveEvent {
  id: string;
  name: string;
  description: string;
  startsAt: string;
  venue: string;
  town: string | null;
  website: string;
  priceText: string;
  photoColor: string;
}

interface EventRow {
  id: string;
  name: string;
  description: string;
  starts_at: string;
  venue: string;
  town_id: string | null;
  website: string;
  price_text: string;
  photo_color: string;
}

function mapEventRow(row: EventRow): LiveEvent {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    startsAt: row.starts_at,
    venue: row.venue,
    town: row.town_id,
    website: row.website,
    priceText: row.price_text,
    photoColor: row.photo_color,
  };
}

/** The one event that gets the banner slot at the top of /whats-on. */
export interface FeaturedEvent extends LiveEvent {
  endsAt: string | null;
  imageUrl: string;
  /** "Sponsored" for a paid placement, "Featured" for an editorial pick. */
  sponsorLabel: string;
  ctaLabel: string;
}

interface FeaturedEventRow extends EventRow {
  ends_at: string | null;
  image_url: string;
  sponsor_label: string;
  cta_label: string;
}

export type SponsorTargetType = "category" | "town";

export interface Sponsorship {
  id: string;
  targetType: SponsorTargetType;
  targetId: string;
  sponsorName: string;
  headline: string;
  website: string;
  imageUrl: string;
  photoColor: string;
}

export interface SponsorshipRow {
  id: string;
  target_type: SponsorTargetType;
  target_id: string;
  sponsor_name: string;
  headline: string;
  website: string;
  image_url: string;
  photo_color: string;
}

export const SPONSORSHIP_COLUMNS = "id, target_type, target_id, sponsor_name, headline, website, image_url, photo_color";

export function mapSponsorshipRow(row: SponsorshipRow): Sponsorship {
  return {
    id: row.id,
    targetType: row.target_type,
    targetId: row.target_id,
    sponsorName: row.sponsor_name,
    headline: row.headline,
    website: row.website,
    imageUrl: row.image_url,
    photoColor: row.photo_color,
  };
}

async function attachVotes<T extends { id: string }>(
  rows: T[]
): Promise<(T & { liveVotes: number })[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const { data, error } = await supabase
    .from("business_vote_counts")
    .select("business_id, total_votes")
    .in("business_id", ids);

  if (error) throw error;

  const votesById = new Map((data ?? []).map((v) => [v.business_id, v.total_votes as number]));
  return rows.map((r) => ({ ...r, liveVotes: votesById.get(r.id) ?? 0 }));
}

export const Store = {
  async getApprovedBusinesses(options?: {
    category?: string;
    categories?: string[];
    town?: string;
  }): Promise<LiveBusiness[]> {
    let query = supabase.from("businesses").select("*").eq("status", "approved");
    if (options?.category) {
      query = query.eq("category_id", options.category);
    } else if (options?.categories) {
      query = query.in("category_id", options.categories);
    }
    if (options?.town) {
      query = query.eq("town_id", options.town);
    }

    const { data, error } = await query;
    if (error) throw error;

    const businesses = (data as BusinessRow[]).map((row) => ({
      ...mapBusinessRow(row),
      votes: 0, // unused now liveVotes carries the real total; kept for the Business shape
      testimonials: [] as Testimonial[],
    }));

    return attachVotes(businesses);
  },

  async searchBusinesses(
    query: string,
    options: { categoryLabels: Record<string, string>; townLabels: Record<string, string>; town?: string }
  ): Promise<LiveBusiness[]> {
    const q = `%${query.trim()}%`;
    const needle = query.trim().toLowerCase();

    // Category/town labels aren't real columns, so a query matching only
    // a category or town name (e.g. "accountant", "devizes") is resolved
    // against the small static lookups first, then included as extra
    // filters in the same query - not a second round-trip, and not
    // limited to values already present in a plain text match.
    const matchingCategoryIds = Object.entries(options.categoryLabels)
      .filter(([, label]) => label.toLowerCase().includes(needle))
      .map(([id]) => id);
    const matchingTownIds = Object.entries(options.townLabels)
      .filter(([, label]) => label.toLowerCase().includes(needle))
      .map(([id]) => id);

    const filters = [`name.ilike.${q}`, `tagline.ilike.${q}`, `description.ilike.${q}`, `location.ilike.${q}`];
    if (matchingCategoryIds.length > 0) {
      filters.push(`category_id.in.(${matchingCategoryIds.join(",")})`);
    }
    if (matchingTownIds.length > 0) {
      filters.push(`town_id.in.(${matchingTownIds.join(",")})`);
    }

    let dbQuery = supabase.from("businesses").select("*").eq("status", "approved").or(filters.join(","));
    // The town filter (an explicit dropdown choice) narrows the match
    // further, on top of whatever the free-text query already found.
    if (options.town) {
      dbQuery = dbQuery.eq("town_id", options.town);
    }

    const { data, error } = await dbQuery;

    if (error) throw error;

    const businesses = (data as BusinessRow[]).map((row) => ({
      ...mapBusinessRow(row),
      votes: 0,
      testimonials: [] as Testimonial[],
    }));

    return attachVotes(businesses);
  },

  async getBusinessById(id: string): Promise<LiveBusiness | null> {
    const { data, error } = await supabase.from("businesses").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const { data: testimonialRows, error: testimonialError } = await supabase
      .from("testimonials")
      .select("name, quote")
      .eq("business_id", id);
    if (testimonialError) throw testimonialError;

    const business = {
      ...mapBusinessRow(data as BusinessRow),
      votes: 0,
      testimonials: (testimonialRows ?? []) as Testimonial[],
    };
    const [withVotes] = await attachVotes([business]);
    return withVotes;
  },

  hasVoted(id: string): boolean {
    return getVotedIdsLocal().includes(id);
  },

  async addVote(id: string): Promise<boolean> {
    if (this.hasVoted(id)) return false;

    const { error } = await supabase.from("votes").insert({ business_id: id, voter_id: getVoterId() });

    if (error) {
      // 23505 = unique_violation - this browser (or voter id) already
      // voted, most likely because dw_voted_ids was cleared separately
      // from dw_voter_id. Treat it as already-voted rather than an error.
      if (error.code === "23505") {
        rememberVotedLocal(id);
        return false;
      }
      throw error;
    }

    rememberVotedLocal(id);
    return true;
  },

  // Submitting a new listing inserts straight into businesses with
  // status='pending' - RLS only allows inserts with that status, so a
  // submission can never self-approve. The admin queue (reading pending
  // rows) needs the service-role key from a server route, added later.
  async submitListing(fields: {
    id: string;
    name: string;
    category: string;
    tagline: string;
    description: string;
    location: string;
    town: string;
    priceRange: string;
    phone: string;
    website: string;
  }): Promise<void> {
    const { error } = await supabase.from("businesses").insert({
      id: fields.id,
      name: fields.name,
      category_id: fields.category,
      tagline: fields.tagline,
      description: fields.description,
      location: fields.location,
      town_id: fields.town,
      price_range: fields.priceRange,
      phone: fields.phone,
      website: fields.website || "#",
      status: "pending",
    });
    if (error) throw error;
  },

  async submitUpgradeRequest(businessId: string, type: "promoted-slot" | "founding-member", detail: string): Promise<void> {
    const { error } = await supabase.from("upgrade_requests").insert({
      business_id: businessId,
      request_type: type,
      detail,
      status: "pending",
    });
    if (error) throw error;
  },

  // Only approved, still-upcoming events, soonest first - same shape for
  // the homepage strip (pass a small limit), the full /whats-on calendar
  // (no limit), and a town hub's sidebar (pass that town's id).
  async getUpcomingEvents(limit?: number, town?: string): Promise<LiveEvent[]> {
    let query = supabase
      .from("events")
      .select("id, name, description, starts_at, venue, town_id, website, price_text, photo_color")
      .eq("status", "approved")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true });
    if (town) query = query.eq("town_id", town);
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data as EventRow[]).map(mapEventRow);
  },

  // The featured event, if there is one and it hasn't finished. It keeps its
  // slot while it's running (until ends_at, or its start for a one-day event),
  // not just until it begins. Kept separate from getUpcomingEvents on purpose:
  // if the columns don't exist yet (migration 0008 not run) or the lookup
  // fails, this returns null and every other events query is unaffected.
  async getFeaturedEvent(): Promise<FeaturedEvent | null> {
    const { data, error } = await supabase
      .from("events")
      .select(
        "id, name, description, starts_at, ends_at, venue, town_id, website, price_text, photo_color, image_url, sponsor_label, cta_label"
      )
      .eq("status", "approved")
      .eq("featured", true)
      .maybeSingle();
    if (error) {
      // 42703/PGRST204 = the featured columns haven't been added yet; that's expected, not worth logging.
      if (error.code !== "42703" && error.code !== "PGRST204" && error.code !== "PGRST200") {
        console.error("Failed to load featured event:", error);
      }
      return null;
    }
    if (!data) return null;

    const row = data as FeaturedEventRow;
    const lastMoment = new Date(row.ends_at ?? row.starts_at).getTime();
    if (lastMoment < Date.now()) return null;

    return {
      ...mapEventRow(row),
      endsAt: row.ends_at,
      imageUrl: row.image_url,
      sponsorLabel: row.sponsor_label || "Featured",
      ctaLabel: row.cta_label || "Find out more",
    };
  },

  // Submitting an event inserts straight into events with status='pending',
  // same pattern as submitListing - RLS only allows inserts with that
  // status, so a submission can never self-approve.
  async submitEvent(fields: {
    name: string;
    description: string;
    startsAt: string;
    venue: string;
    town: string;
    website: string;
    priceText: string;
  }): Promise<void> {
    const { error } = await supabase.from("events").insert({
      name: fields.name,
      description: fields.description,
      starts_at: fields.startsAt,
      venue: fields.venue,
      town_id: fields.town || null,
      website: fields.website || "#",
      price_text: fields.priceText,
      status: "pending",
    });
    if (error) throw error;
  },

  // The sponsor for one category or town page, or null if it's unsold. A
  // failed lookup also returns null (logged): the sponsor slot is an extra
  // on the page, and a hiccup there shouldn't take the whole page down.
  async getSponsorship(targetType: SponsorTargetType, targetId: string): Promise<Sponsorship | null> {
    const { data, error } = await supabase
      .from("sponsorships")
      .select(SPONSORSHIP_COLUMNS)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .maybeSingle();
    if (error) {
      console.error("Failed to load sponsorship:", error);
      return null;
    }
    return data ? mapSponsorshipRow(data as SponsorshipRow) : null;
  },

  // The Journal's cards, newest first. Row-level security already limits
  // the public role to published entries whose date has arrived, so drafts
  // and scheduled entries can't appear here. A failed lookup returns an
  // empty list (logged) rather than taking the page down.
  async getJournalEntries(limit?: number): Promise<JournalSummary[]> {
    let query = supabase
      .from("journal_entries")
      .select(JOURNAL_SUMMARY_COLUMNS)
      .order("published_at", { ascending: false });
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.error("Failed to load journal entries:", error);
      return [];
    }
    return (data as JournalSummaryRow[]).map(mapJournalSummaryRow);
  },

  // One live entry by its address, or null (unknown, draft, or not yet due).
  async getJournalEntryBySlug(slug: string): Promise<JournalEntry | null> {
    const { data, error } = await supabase
      .from("journal_entries")
      .select(JOURNAL_ENTRY_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      console.error("Failed to load journal entry:", error);
      return null;
    }
    return data ? mapJournalEntryRow(data as JournalEntryRow) : null;
  },

  // Approved reviews for one business, newest first. Row-level security
  // already limits the public role to approved reviews. A failed lookup (for
  // instance before the members migration has been run) returns an empty
  // list, logged, rather than taking the business page down.
  async getApprovedReviews(businessId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from("reviews")
      .select(REVIEW_COLUMNS)
      .eq("business_id", businessId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load reviews:", error);
      return [];
    }
    return (data as ReviewRow[]).map(mapReviewRow);
  },

  // Average rating and count for one business, or null if it has no
  // approved reviews (or the lookup failed).
  async getReviewStats(businessId: string): Promise<ReviewStats | null> {
    const { data, error } = await supabase
      .from("business_review_stats")
      .select("review_count, avg_rating")
      .eq("business_id", businessId)
      .maybeSingle();
    if (error) {
      console.error("Failed to load review stats:", error);
      return null;
    }
    return data ? { reviewCount: data.review_count as number, avgRating: Number(data.avg_rating) } : null;
  },

  // Trade categories (e.g. "Painters", "Plumbers") are admin-editable via
  // /admin/categories, so - unlike the four core categories - they live in
  // the database rather than static data.ts, and every page that lists or
  // validates them needs to read from here instead of a hardcoded array.
  async getTradeCategories(): Promise<TradeCategory[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("id, label")
      .eq("category_group", "trade")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, label: row.label }));
  },

  // Full id -> label map across both core (static) and trade (DB) categories,
  // for anywhere that needs to display a category name given only its id
  // (e.g. Leaderboard's category tag, search matching).
  async getCategoryLabels(): Promise<Record<string, string>> {
    const trades = await this.getTradeCategories();
    const labels: Record<string, string> = { ...CATEGORY_LABELS_CORE };
    for (const cat of trades) labels[cat.id] = cat.label;
    return labels;
  },
};
