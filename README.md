# Discover Wiltshire — prototype

A working, dependency-free prototype of the Discover Wiltshire site, built from the design and product decisions worked out in chat. It's plain HTML/CSS/JS — open `index.html` in a browser and it runs, no build step, no install.

Open it in Claude Code and it can pick up from here: extend pages, wire up a real backend, or convert it to a framework (Next.js, Astro, etc.) if you want one.

## What's actually working right now

This isn't just a static mockup — the core loop functions, backed by `localStorage` standing in for a database:

- **Upvoting** on any leaderboard row or business page increments a live count and locks that business against repeat votes from the same browser.
- **Submitting the "List your business" form** validates required fields, then drops the submission into the admin approval queue.
- **Approving a submission** in the admin queue publishes it as a real, upvotable business — it appears immediately on the homepage and its category page.
- **The nav's "Explore" dropdown grows itself.** The trades & services list inside it (and the chip row on `trades.html`/`category.html`) is generated at page load from `TRADE_CATEGORIES` in `js/data.js`, not hand-written per page — add a category there and it shows up everywhere with a working page, nothing else to touch.
- Everything resets if `localStorage` is cleared — there's no real backend yet, by design (see "What still needs a real backend" below).

## Page inventory

| File | What it is |
|---|---|
| `index.html` | Homepage — the master leaderboard across all categories |
| `eat-drink.html`, `stay.html`, `things-to-do.html`, `shops.html` | Per-category leaderboards (Eat & drink carries the example category sponsor banner) |
| `trades.html` | Trades & services hub — mixed leaderboard across all trade categories, with a chip row to jump into any one of them |
| `category.html?slug=<id>` | One generic page for every trade category (painters, plumbers, electricians, accountants, ... 30 in total) — see `TRADE_CATEGORIES` in `js/data.js` to add more. Formatted exactly like the four core category pages above, just parameterised instead of hand-built per category |
| `business.html?id=<id>` | Individual business profile page |
| `list-your-business.html` | Free listing submission form, with an optional founding-membership add-on |
| `pricing.html` | Pricing page copy for all revenue lines (promoted slots, category sponsorship, featured upgrade, founding membership) |
| `admin-approval-queue.html` | Internal queue for approving/declining listings and purchases — **not linked from the public nav**, and has no authentication yet |
| `about.html`, `whats-on.html` | Placeholder pages so nav links aren't dead — flagged on-page as needing real content |

## Design system

Defined in `css/styles.css` as CSS custom properties:

- **Colour**: warm cream background (`--bg`), ink charcoal text (`--ink`), terracotta accent (`--terracotta`) for primary actions and upvotes, hedgerow green and mustard as secondary accents for tags.
- **Type**: Fraunces (serif) for headlines and the brand "voice" moments, Inter (sans) for everything else — loaded via Google Fonts, so an internet connection is needed for the fonts specifically (everything else works offline).
- **Voice**: lowercase, sentence-case headings, short and opinionated copy — "the friend who knows Wiltshire best" plus "official, curated, always up to date." Avoid corporate phrasing, ALL CAPS labels, and generic SaaS chrome.
- A basic `prefers-color-scheme: dark` override exists but hasn't been thoroughly checked for contrast — worth a real pass before launch.

## Known simplifications (flagged intentionally, not bugs)

- **Promoted-slot logic is simplified.** The brief calls for exactly 4 sellable positions per list, backfilled by the next-best organic business when unsold. This prototype just pins any `promoted: true` business to the top instead — fine for demonstrating the idea, not fine for production, where the 4-slot cap needs real enforcement.
- **The Today / This week / This month toggle is cosmetic.** Real period filtering needs vote timestamps, which needs a backend.
- **No payments are wired up.** Promoted slots, category sponsorship, the featured upgrade, and founding membership all need real checkout (Stripe or similar) plus the "paid but pending approval" state the approval queue currently only half-models.
- **No authentication anywhere.** Not on the admin queue (which anyone with the URL can currently reach), and not for businesses claiming or editing their own listing.
- **Comments/testimonials are hand-seeded**, not a real submission system.

## Suggested next steps

1. Decide whether this stays a static site or becomes a framework app — Claude Code can scaffold either from here.
2. Replace `js/store.js`'s localStorage layer with real API calls against a database; the function names are already shaped like an API (`getAllBusinesses`, `addVote`, `addPendingItem`, etc.) so callers shouldn't need to change much.
3. Add authentication for the admin queue and for business owners managing their own listing.
4. Wire up payments for the four paid products in `pricing.html`.
5. Replace the placeholder photo colour blocks with real image handling.
6. Write real copy for `about.html` and decide the scope of `whats-on.html`.

## A note on the pricing figures

The numbers in `pricing.html` (£25/week category slots, £50/week homepage slots, £150/month category sponsorship, £75 featured upgrade, £99 founding membership) were suggested starting points from the design conversation, not confirmed final pricing. Sanity-check them against real Wiltshire businesses before launch.
