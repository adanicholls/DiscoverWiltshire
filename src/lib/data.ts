/* ---------------------------------------------------
   Discover Wiltshire — seed data
   Ported from the static prototype's js/data.js. This is temporary
   seed data standing in for Supabase — see store.ts for the layer
   that will be swapped for real database calls.
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

export interface TradeCategory {
  id: string;
  label: string;
}

export interface EventItem {
  name: string;
  when: string;
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

export const BUSINESSES: Business[] = [
  {
    id: "old-forge-kitchen",
    name: "The Old Forge Kitchen",
    category: "eat-drink",
    tagline: "seasonal menu, chef's table Fridays",
    description:
      "A proper seasonal menu that changes with what's good that week, plus a chef's table on Fridays if you want to watch it happen. Booking ahead is worth it — this one fills up fast.",
    location: "Marlborough",
    priceRange: "££",
    phone: "01672 000000",
    website: "#",
    votes: 142,
    promoted: true,
    featured: false,
    foundingMember: true,
    photoColor: "#D9C7A3",
    testimonials: [
      { name: "Hannah, Marlborough", quote: "The chef's table is worth every penny, best meal we've had locally this year." },
      { name: "Tom, Pewsey", quote: "Menu changes often enough that it's never boring going back." },
    ],
  },
  {
    id: "the-bell-ramsbury",
    name: "The Bell, Ramsbury",
    category: "eat-drink",
    tagline: "proper Sunday roasts, dog-friendly",
    description:
      "A village pub that takes its Sunday roasts seriously. Dogs welcome, log fire in winter, and a beer garden worth lingering in come summer.",
    location: "Ramsbury",
    priceRange: "££",
    phone: "01672 000001",
    website: "#",
    votes: 128,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#C9CFB5",
    testimonials: [{ name: "Sam, Ramsbury", quote: "Our regular Sunday spot, never disappoints." }],
  },
  {
    id: "wilton-yard-studios",
    name: "Wilton Yard Studios",
    category: "things-to-do",
    tagline: "weekend pottery classes, all levels",
    description:
      "Hands-on pottery classes every weekend, taught by working local potters. No experience needed, and you take home what you make.",
    location: "Wilton",
    priceRange: "£",
    phone: "01722 000000",
    website: "#",
    votes: 94,
    promoted: false,
    featured: true,
    foundingMember: false,
    photoColor: "#B9C2CC",
    testimonials: [{ name: "Priya, Salisbury", quote: "Went as a total beginner, left with a bowl I actually use." }],
  },
  {
    id: "barn-coombe-farm",
    name: "Barn at Coombe Farm",
    category: "stay",
    tagline: "stays with a view, sleeps 6",
    description:
      "A converted barn with views across the valley, sleeps up to six. Fires lit for you on arrival in the colder months.",
    location: "Coombe Bissett",
    priceRange: "£££",
    phone: "01722 000001",
    website: "#",
    votes: 81,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#DCC3A9",
    testimonials: [],
  },
  {
    id: "chalk-and-vine",
    name: "Chalk & Vine Wine Bar",
    category: "eat-drink",
    tagline: "local wines, small plates, live jazz Thursdays",
    description:
      "A small, warm wine bar with an English-leaning list and small plates built to share. Live jazz most Thursdays.",
    location: "Devizes",
    priceRange: "££",
    phone: "01380 000000",
    website: "#",
    votes: 63,
    promoted: false,
    featured: true,
    foundingMember: false,
    photoColor: "#E4D2B0",
    testimonials: [],
  },
  {
    id: "devizes-outdoor-co",
    name: "Devizes Outdoor Co",
    category: "shops",
    tagline: "walking gear, maps, and local advice",
    description:
      "Proper walking and camping gear, plus the best local trail advice you will get from anyone behind a till.",
    location: "Devizes",
    priceRange: "££",
    phone: "01380 000001",
    website: "#",
    votes: 51,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#C7B79E",
    testimonials: [],
  },
  {
    id: "wren-and-willow",
    name: "Wren & Willow",
    category: "shops",
    tagline: "handmade gifts and local crafts",
    description:
      "A small shop stocking makers from across the county — pottery, textiles, and cards you will not find on the high street.",
    location: "Marlborough",
    priceRange: "£",
    phone: "01672 000002",
    website: "#",
    votes: 44,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#E8DCC4",
    testimonials: [],
  },
  {
    id: "the-vine-marlborough",
    name: "The Vine",
    category: "eat-drink",
    tagline: "live folk night every Friday",
    description:
      "A proper local with a live folk session every Friday night and a decent range of local ales on tap.",
    location: "Marlborough",
    priceRange: "£",
    phone: "01672 000003",
    website: "#",
    votes: 39,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#CBB9E0",
    testimonials: [],
  },
  {
    id: "salisbury-rowing-club",
    name: "Salisbury Rowing Club",
    category: "things-to-do",
    tagline: "taster sessions on the Avon",
    description:
      "Beginner taster sessions on the river Avon most weekends — no experience needed, all kit provided.",
    location: "Salisbury",
    priceRange: "£",
    phone: "01722 000002",
    website: "#",
    votes: 33,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#A9C4D8",
    testimonials: [],
  },
  {
    id: "meadow-view-bandb",
    name: "Meadow View B&B",
    category: "stay",
    tagline: "quiet rooms, big breakfasts",
    description:
      "A quiet, family-run B&B just outside Devizes, known locally for breakfasts that will set you up for the day.",
    location: "Devizes",
    priceRange: "££",
    phone: "01380 000002",
    website: "#",
    votes: 28,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#D8CBB0",
    testimonials: [],
  },
  {
    id: "kennet-valley-decorators",
    name: "Kennet Valley Decorators",
    category: "painters",
    tagline: "interior & exterior, free quotes",
    description:
      "A small local team doing interior and exterior painting across the Kennet valley. Free, no-obligation quotes, and they clean up properly after themselves.",
    location: "Marlborough",
    priceRange: "££",
    phone: "01672 000010",
    website: "#",
    votes: 37,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#EADFC8",
    testimonials: [],
  },
  {
    id: "downland-plumbing",
    name: "Downland Plumbing & Heating",
    category: "plumbers",
    tagline: "24/7 call-outs, boiler servicing",
    description:
      "Gas Safe registered, with a genuine 24/7 call-out line for the burst-pipe emergencies as well as routine boiler servicing.",
    location: "Devizes",
    priceRange: "££",
    phone: "01380 000010",
    website: "#",
    votes: 45,
    promoted: false,
    featured: true,
    foundingMember: false,
    photoColor: "#C4D3DC",
    testimonials: [],
  },
  {
    id: "wessex-electrical",
    name: "Wessex Electrical Services",
    category: "electricians",
    tagline: "NICEIC registered, rewires & EV chargers",
    description:
      "NICEIC-registered electricians covering everything from full rewires to EV charger installs. Certificates provided on every job.",
    location: "Salisbury",
    priceRange: "££",
    phone: "01722 000010",
    website: "#",
    votes: 31,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#D9D2C3",
    testimonials: [],
  },
  {
    id: "chalke-valley-accountancy",
    name: "Chalke Valley Accountancy",
    category: "accountants",
    tagline: "sole traders & small business specialists",
    description:
      "A small practice that specialises in sole traders and small local businesses — self-assessment, bookkeeping, and straightforward advice.",
    location: "Wilton",
    priceRange: "£££",
    phone: "01722 000011",
    website: "#",
    votes: 22,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#CBD6C6",
    testimonials: [],
  },
  {
    id: "avonbank-builders",
    name: "Avonbank Builders",
    category: "builders",
    tagline: "extensions, renovations, loft conversions",
    description:
      "A family building firm handling extensions, renovations, and loft conversions across the county, with references available for every recent job.",
    location: "Chippenham",
    priceRange: "£££",
    phone: "01249 000010",
    website: "#",
    votes: 19,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#DCC9B0",
    testimonials: [],
  },
  {
    id: "greenhedge-gardens",
    name: "Greenhedge Gardens",
    category: "gardeners",
    tagline: "garden design & regular maintenance",
    description:
      "Garden design and regular maintenance rounds, from a single tidy-up to a full replanting. Happy to work to a seasonal schedule.",
    location: "Pewsey",
    priceRange: "££",
    phone: "01672 000011",
    website: "#",
    votes: 15,
    promoted: false,
    featured: false,
    foundingMember: false,
    photoColor: "#C3D0A8",
    testimonials: [],
  },
];

export const EVENTS: EventItem[] = [
  { name: "Devizes farmers' market", when: "Sat, 9am" },
  { name: "Live folk night, The Vine", when: "Fri, 8pm" },
];

export const CATEGORY_SPONSORS: Record<string, string> = {
  "eat-drink": "Kennet Valley Brewery",
};
