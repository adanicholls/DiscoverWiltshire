/* ---------------------------------------------------
   Discover Wiltshire — category taxonomy
   The category structure (which pages exist, their labels, the nav)
   stays as static data here rather than a database table lookup on
   every request — it changes rarely and isn't really "content" the
   way businesses/votes/events are. Actual business, vote, and event
   data now lives in Supabase — see store.ts.
--------------------------------------------------- */

export interface Testimonial {
  name: string;
  quote: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  location: string;
  town: string | null;
  priceRange: string;
  phone: string;
  website: string;
  votes: number;
  promoted: boolean;
  featured: boolean;
  foundingMember: boolean;
  photoColor: string;
  testimonials: Testimonial[];
}

export interface Town {
  id: string;
  label: string;
}

export interface TradeCategory {
  id: string;
  label: string;
}

export const CATEGORY_LABELS_CORE: Record<string, string> = {
  "eat-drink": "Eat & drink",
  stay: "Stay",
  "things-to-do": "Things to do",
  shops: "Shops",
};

// The four categories above each get their own hand-built page
// (eat-drink, stay, things-to-do, shops), styled and worded
// specifically for that page.
export const DIRECT_CATEGORY_PAGES = Object.keys(CATEGORY_LABELS_CORE);

// Trades & services (Painters, Plumbers, Motoring, etc.) used to be a
// hardcoded list here, but they're now admin-editable via /admin/categories
// and live in the `categories` Supabase table instead — see
// Store.getTradeCategories() / Store.getCategoryLabels() in lib/store.ts.
// Core categories stay static since each has its own hand-built page, not
// something addable via that admin UI.

export const CATEGORY_SPONSORS: Record<string, string> = {
  "eat-drink": "Kennet Valley Brewery",
};

// Wiltshire's major towns, for the town hub pages and the location
// filter - a fixed list rather than a free-text field (towns don't need
// to be admin-editable the way trade categories do). Businesses also
// keep a free-text `location` for display precision (e.g. "Coombe
// Bissett"); `town` is the nearest entry here, used for grouping and
// filtering.
export const TOWNS: Town[] = [
  { id: "salisbury", label: "Salisbury" },
  { id: "trowbridge", label: "Trowbridge" },
  { id: "chippenham", label: "Chippenham" },
  { id: "devizes", label: "Devizes" },
  { id: "marlborough", label: "Marlborough" },
  { id: "warminster", label: "Warminster" },
  { id: "westbury", label: "Westbury" },
  { id: "melksham", label: "Melksham" },
  { id: "calne", label: "Calne" },
  { id: "amesbury", label: "Amesbury" },
  { id: "bradford-on-avon", label: "Bradford-on-Avon" },
  { id: "corsham", label: "Corsham" },
  { id: "malmesbury", label: "Malmesbury" },
  { id: "royal-wootton-bassett", label: "Royal Wootton Bassett" },
  { id: "tidworth", label: "Tidworth" },
  { id: "pewsey", label: "Pewsey" },
];

export const TOWN_LABELS: Record<string, string> = Object.fromEntries(TOWNS.map((t) => [t.id, t.label]));
