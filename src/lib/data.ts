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

// Trades & services: a much longer tail of categories than the four
// above, all sharing one generic route (/trades/[slug]) instead of a
// hand-built page each. Add a new trade by adding one entry here; it
// shows up in the nav dropdown, the trades hub, the "list your
// business" category picker, and gets a working leaderboard page
// automatically.
export const TRADE_CATEGORIES: TradeCategory[] = [
  { id: "painters", label: "Painters & decorators" },
  { id: "plumbers", label: "Plumbers" },
  { id: "electricians", label: "Electricians" },
  { id: "builders", label: "Builders" },
  { id: "roofers", label: "Roofers" },
  { id: "carpenters", label: "Carpenters & joiners" },
  { id: "plasterers", label: "Plasterers" },
  { id: "tilers", label: "Tilers" },
  { id: "flooring", label: "Flooring fitters" },
  { id: "kitchen-fitters", label: "Kitchen fitters" },
  { id: "bathroom-fitters", label: "Bathroom fitters" },
  { id: "gardeners", label: "Gardeners & landscapers" },
  { id: "tree-surgeons", label: "Tree surgeons" },
  { id: "cleaners", label: "Cleaners" },
  { id: "window-cleaners", label: "Window cleaners" },
  { id: "locksmiths", label: "Locksmiths" },
  { id: "handymen", label: "Handymen" },
  { id: "removals", label: "Removals" },
  { id: "pest-control", label: "Pest control" },
  { id: "driveways", label: "Driveways & paving" },
  { id: "accountants", label: "Accountants" },
  { id: "solicitors", label: "Solicitors" },
  { id: "financial-advisers", label: "Financial advisers" },
  { id: "estate-agents", label: "Estate agents" },
  { id: "vets", label: "Vets" },
  { id: "dentists", label: "Dentists" },
  { id: "hairdressers", label: "Hairdressers & barbers" },
  { id: "beauty-salons", label: "Beauty salons" },
  { id: "driving-instructors", label: "Driving instructors" },
  { id: "photographers", label: "Photographers" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  ...CATEGORY_LABELS_CORE,
  ...Object.fromEntries(TRADE_CATEGORIES.map((c) => [c.id, c.label])),
};

export const CATEGORY_SPONSORS: Record<string, string> = {
  "eat-drink": "Kennet Valley Brewery",
};

// Wiltshire's major towns, for the town hub pages and the location
// filter - a fixed list rather than a free-text field, same reasoning
// as TRADE_CATEGORIES. Businesses also keep a free-text `location` for
// display precision (e.g. "Coombe Bissett"); `town` is the nearest
// entry here, used for grouping and filtering.
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
