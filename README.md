# Discover Wiltshire

A local business directory for Wiltshire, ranked by real upvotes rather than who pays the most. Started as a static HTML/CSS/JS prototype, since migrated to a real app:

- **Next.js** (App Router, TypeScript) — [discover-wiltshire.vercel.app](https://discover-wiltshire.vercel.app), auto-deployed from `main`
- **Supabase** (Postgres, Row Level Security, Auth) for the database and admin login
- **Stripe** — not wired up yet, see "Suggested next steps"

## Getting started locally

```bash
npm install
cp .env.example .env.local   # fill in real values, see below
npm run dev
```

`.env.local` needs:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page — the `anon`/publishable key, safe for the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page — the `service_role`/secret key. **Server-side only**, never sent to the browser. Used by the admin area to bypass Row Level Security (reading pending listings, editing any business) |
| `ADMIN_EMAIL` | The one email address allowed into `/admin` — must match a user created directly in Supabase → Authentication → Users (there's no public sign-up form, deliberately) |

## Page inventory

| Route | What it is |
|---|---|
| `/` | Homepage — modelled on producthunt.com's: fixed top bar with a Ctrl+K search dialog, a left sidebar of page links (plus the latest Journal entries and upcoming events), and a dark rounded panel holding a hero search card and ranked "Top in Wiltshire" / per-category tables with working upvotes. That shell (`src/components/home/`, styles in `home.css`) is the layout for **every public page** — they all live in the `src/app/(site)/` route group, whose `layout.tsx` supplies the top bar, sidebar and dark panel; `/admin` keeps its own plainer layout. Inside the shell the site's colour tokens are re-pointed at the dark palette, so shared components follow automatically. `/?town=<id>` still filters the rankings to one town |
| `/eat-drink`, `/stay`, `/things-to-do`, `/shops` | The four core category pages — each with a sponsor card and upcoming events in a right-hand column |
| `/trades`, `/trades/[slug]` | Trades & services hub, plus one generic page for each of 30 trade categories — see `TRADE_CATEGORIES` in `src/lib/data.ts` to add more |
| `/towns`, `/towns/[slug]` | A directory of Wiltshire's major towns, plus one generic page per town mixing every category — see `TOWNS` in `src/lib/data.ts` |
| `/business/[id]` | Individual business profile page |
| `/list-your-business` | Free listing submission form, with an optional founding-membership add-on |
| `/pricing` | Pricing copy for all revenue lines (promoted slots, category and town sponsorship, featured upgrade, founding membership) |
| `/admin`, `/admin/businesses`, `/admin/businesses/[id]/edit` | Approval queue and business editor — real Supabase Auth login required, gated by `src/proxy.ts` and re-checked in every Server Action |
| `/admin/categories`, `/admin/events`, `/admin/sponsors` | Manage trade categories, the events calendar, and the sponsor shown on each category/town page (image upload goes to the public `sponsor-images` Storage bucket) |
| `/admin/journal`, `/admin/journal/new`, `/admin/journal/[id]/edit` | Write and manage Journal entries: Markdown editor with toolbar, live preview and inline image upload (to the public `journal-images` bucket), drafts, and scheduling by setting a future publish date |
| `/journal`, `/journal/[slug]` | The Journal (formerly "Our story" at `/about`, which redirects here). The index is a filterable card grid with "Load more"; an **article** has its own page (sticky title column beside the article, share buttons, related entries), a **news** card links out to another site. `/journal?category=…` and `?type=news` are shareable filtered views |
| `/whats-on`, `/whats-on/add` | The events calendar and its public submission form (events are approved in `/admin`) |

## Data model

Everything lives in Supabase — see `supabase/migrations/` for the full schema history. Roughly:

- **`categories`** / **`towns`** — the two taxonomies (which categories/towns exist, their labels). Kept as static data in `src/lib/data.ts` too, since this rarely changes and drives the nav — the DB tables exist mainly for foreign-key integrity on `businesses`.
- **`businesses`** — one row per listing, `status` of `pending`/`approved`/`declined`. New submissions insert directly here with `status='pending'` (RLS only allows that), rather than a separate submissions table.
- **`votes`** — one row per (business, anonymous voter id), with real timestamps. A unique constraint enforces one vote per visitor server-side, not just client-side bookkeeping. Individual votes aren't publicly readable (privacy); live counts come from the `business_vote_counts` view instead.
- **`upgrade_requests`** — promoted-slot / founding-member purchases against an *existing* business, reviewed alongside pending listings in the admin queue.
- **`sponsorships`** — the "Sponsored" card on a category or town page: one row per sponsored page (`target_type` is `category` or `town`, `target_id` the id), unique per page. Superseded the old `category_sponsors` table, which is left in place but unused.
- **`journal_entries`** — the Journal. `entry_type` is `article` (Markdown `body`, own page at `/journal/<slug>`) or `news` (`external_url` + button text, no page of its own). `category` is free text — the filter pills are built from whichever categories published entries use. Row-level security only lets the public read entries that are `published` **and** whose `published_at` has arrived, so drafts and scheduled entries can't leak through the API; all writes go through the admin with the service-role key.
- **`testimonials`**, **`events`** — smaller supporting tables.

`src/lib/store.ts` is the single place that talks to Supabase for the public site (reads, votes, submissions) — same function shapes throughout, so components don't need to know it's a network call. The admin area uses its own service-role client (`src/lib/supabase-admin.ts`) since it needs to bypass RLS.

## Design system

Defined in `src/app/globals.css` as CSS custom properties:

- **Colour**: warm cream background (`--bg`), ink charcoal text (`--ink`), terracotta accent (`--terracotta`) for primary actions and upvotes, hedgerow green and mustard as secondary accents for tags.
- **Type**: Fraunces (serif) for headlines and the brand "voice" moments, Inter (sans) for everything else — via `next/font/google`.
- **Voice**: lowercase, sentence-case headings, short and opinionated copy — "the friend who knows Wiltshire best" plus "official, curated, always up to date." Avoid corporate phrasing, ALL CAPS labels, and generic SaaS chrome.
- A basic `prefers-color-scheme: dark` override exists but hasn't been thoroughly checked for contrast — worth a real pass before launch.

## Known simplifications (flagged intentionally, not bugs)

- **Promoted-slot logic is simplified.** The brief calls for exactly 4 sellable positions per list, backfilled by the next-best organic business when unsold. The site just pins any `promoted: true` business to the top instead — fine for demonstrating the idea, not fine for production, where the 4-slot cap needs real enforcement.
- **The Today / This week / This month toggle is cosmetic.** Votes now carry real timestamps (`votes.created_at`), so real period filtering is a query away — it's just not wired up to those buttons yet.
- **No payments are wired up.** Promoted slots, category and town sponsorship, the featured upgrade, and founding membership all need real checkout (Stripe) plus the "paid but pending approval" state the approval queue currently only half-models. Sponsors themselves are set up by hand in `/admin/sponsors` after the deal is agreed, and there's no end date — replacing or removing a sponsor when their month is up is manual.
- **No authentication for business owners** managing their own listing (the admin side is real; a business claiming/editing its own profile isn't built).
- **Comments/testimonials are hand-seeded**, not a real submission system.

## Suggested next steps

1. Wire up Stripe for the four paid products in `/pricing`.
2. Add authentication for business owners to claim and edit their own listing (the `businesses.owner_id` column already exists for this).
3. Give businesses real photos instead of placeholder colour blocks — the Storage-upload pattern already exists for sponsors and the journal (`src/app/admin/journal-actions.ts` is the fullest example).
4. Wire the Today/This week/This month toggle to real vote timestamps.

## A note on the pricing figures

The numbers on `/pricing` (£25/week category slots, £50/week homepage slots, £150/month category sponsorship, £100/month town sponsorship, £75 featured upgrade, £99 founding membership) were suggested starting points from the original design conversation, not confirmed final pricing. Sanity-check them against real Wiltshire businesses before launch.
