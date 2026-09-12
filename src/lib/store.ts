/* ---------------------------------------------------
   Discover Wiltshire — demo data store
   Ported from the static prototype's js/store.js. Everything here
   still uses localStorage so the app works end-to-end before Supabase
   is wired in — replace each function body with a real query/mutation
   when that happens; keep the function names the same so components
   calling them shouldn't need to change much.

   Client-only: every function is a no-op-safe read/write against
   localStorage, so this must only be called from Client Components
   (or inside useEffect/event handlers), never during server rendering.
--------------------------------------------------- */

import { BUSINESSES, type Business } from "./data";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable, fail quietly
  }
}

export type PendingItem = {
  id: string;
  type: "listing" | "promoted-slot" | "founding-member";
  name: string;
  category?: string;
  tagline?: string;
  description?: string;
  location?: string;
  priceRange?: string;
  phone?: string;
  website?: string;
  foundingMemberRequested?: boolean;
  detail?: string;
  submittedAgo: string;
};

const SEED_PENDING: PendingItem[] = [
  {
    id: "seed-1",
    type: "listing",
    name: "Potterne Pantry",
    category: "shops",
    tagline: "local deli, cheese counter, coffee to go",
    submittedAgo: "2 hours ago",
  },
  {
    id: "seed-2",
    type: "promoted-slot",
    name: "The Bell, Ramsbury",
    detail: "homepage slot · 1 week · paid",
    submittedAgo: "40 minutes ago",
  },
  {
    id: "seed-3",
    type: "founding-member",
    name: "Wilton Yard Studios",
    detail: "founding membership purchased",
    submittedAgo: "yesterday",
  },
];

export const Store = {
  // Businesses approved after launch, on top of the seed data in data.ts
  getApprovedBusinesses(): Business[] {
    return read("dw_approved_businesses", [] as Business[]);
  },
  addApprovedBusiness(business: Business) {
    const list = this.getApprovedBusinesses();
    list.push(business);
    write("dw_approved_businesses", list);
  },

  // All businesses: seed data + anything approved this session
  getAllBusinesses(): Business[] {
    return BUSINESSES.concat(this.getApprovedBusinesses());
  },
  getBusinessById(id: string): Business | undefined {
    return this.getAllBusinesses().find((b) => b.id === id);
  },

  // Vote deltas, keyed by business id, plus which ids this browser already voted for
  getVoteDeltas(): Record<string, number> {
    return read("dw_vote_deltas", {} as Record<string, number>);
  },
  getVotedIds(): string[] {
    return read("dw_voted_ids", [] as string[]);
  },
  hasVoted(id: string): boolean {
    return this.getVotedIds().includes(id);
  },
  addVote(id: string): boolean {
    if (this.hasVoted(id)) return false;
    const deltas = this.getVoteDeltas();
    deltas[id] = (deltas[id] || 0) + 1;
    write("dw_vote_deltas", deltas);
    const voted = this.getVotedIds();
    voted.push(id);
    write("dw_voted_ids", voted);
    return true;
  },
  votesFor(business: Business): number {
    const deltas = this.getVoteDeltas();
    return business.votes + (deltas[business.id] || 0);
  },

  // Pending queue: new listing submissions and (in a real build) promoted-slot
  // purchases and founding-member sign-ups, all reviewed before going live.
  getPendingItems(): PendingItem[] {
    return read("dw_pending_items", null as unknown as PendingItem[]) ?? this.seedPending();
  },
  seedPending(): PendingItem[] {
    write("dw_pending_items", SEED_PENDING);
    return SEED_PENDING;
  },
  addPendingItem(item: PendingItem) {
    const list = this.getPendingItems();
    list.unshift(item);
    write("dw_pending_items", list);
  },
  removePendingItem(id: string) {
    const list = this.getPendingItems().filter((i) => i.id !== id);
    write("dw_pending_items", list);
  },
};
