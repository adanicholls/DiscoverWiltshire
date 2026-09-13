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

  async getEvents(): Promise<{ name: string; when: string }[]> {
    const { data, error } = await supabase.from("events").select("name, when_text");
    if (error) throw error;
    return (data ?? []).map((row) => ({ name: row.name, when: row.when_text }));
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
