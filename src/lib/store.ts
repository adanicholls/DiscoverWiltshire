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
import type { Business, Testimonial } from "./data";

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
  async getApprovedBusinesses(options?: { category?: string; categories?: string[] }): Promise<LiveBusiness[]> {
    let query = supabase.from("businesses").select("*").eq("status", "approved");
    if (options?.category) {
      query = query.eq("category_id", options.category);
    } else if (options?.categories) {
      query = query.in("category_id", options.categories);
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

  async searchBusinesses(query: string, categoryLabels: Record<string, string>): Promise<LiveBusiness[]> {
    const q = `%${query.trim()}%`;
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("status", "approved")
      .or(`name.ilike.${q},tagline.ilike.${q},description.ilike.${q},location.ilike.${q}`);

    if (error) throw error;

    // Category label isn't a real column to filter server-side against, so
    // a query matching only a category name (e.g. "plumbers") is caught
    // here instead, client-side, against the small categories lookup.
    const byCategory = (data as BusinessRow[]).filter((row) => {
      const label = categoryLabels[row.category_id] || row.category_id;
      return label.toLowerCase().includes(query.trim().toLowerCase());
    });
    const merged = new Map<string, BusinessRow>();
    for (const row of [...(data as BusinessRow[]), ...byCategory]) merged.set(row.id, row);

    const businesses = Array.from(merged.values()).map((row) => ({
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
};
