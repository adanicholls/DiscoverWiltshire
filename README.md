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
| `/` | Homepage — the master leaderboard across all categories, with search and a town filter |
| `/eat-drink`, `/stay`, `/things-to-do`, `/shops` | The four core category pages (Eat & drink carries the example category sponsor banner) |
| `/trades`, `/trades/[slug]` | Trades & services hub, plus one generic page for each of 30 trade categories — see `TRADE_CATEGORIES` in `src/lib/data.ts` to add more |
| `/towns`, `/towns/[slug]` | A directory of Wiltshire's major towns, plus one generic page per town mixing every category — see `TOWNS` in `src/lib/data.ts` |
| `/business/[id]` | Individual business profile page |
| `/list-your-business` | Free listing submission form, with an optional founding-membership add-on |
| `/pricing` | Pricing copy for all revenue lines (promoted slots, category sponsorship, featured upgrade, founding membership) |
| `/admin`, `/admin/businesses`, `/admin/businesses/[id]/edit` | Approval queue and business editor — real Supabase Auth login required, gated by `src/proxy.ts` and re-checked in every Server Action |
| `/about`, `/whats-on` | Placeholder pages so nav links aren't dead — flagged on-page as needing real content |

## Data model

Everything lives in Supabase — see `supabase/migrations/` for the full schema history. Roughly:

- **`categories`** / **`towns`** — the two taxonomies (which categories/towns exist, their labels). Kept as static data in `src/lib/data.ts` too, since this rarely changes and drives the nav — the DB tables exist mainly for foreign-key integrity on `businesses`.
- **`businesses`** — one row per listing, `status` of `pending`/`approved`/`declined`. New submissions insert directly here with `status='pending'` (RLS only allows that), rather than a separate submissions table.
- **`votes`** — one row per (business, anonymous voter id), with real timestamps. A unique constraint enforces one vote per visitor server-side, not just client-side bookkeeping. Individual votes aren't publicly readable (privacy); live counts come from the `business_vote_counts` view instead.
- **`upgrade_requests`** — promoted-slot / founding-member purchases against an *existing* business, reviewed alongside pending listings in the admin queue.
- **`testimonials`**, **`category_sponsors`**, **`events`** — smaller supporting tables.

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
- **No payments are wired up.** Promoted slots, category sponsorship, the featured upgrade, and founding membership all need real checkout (Stripe) plus the "paid but pending approval" state the approval queue currently only half-models.
- **No authentication for business owners** managing their own listing (the admin side is real; a business claiming/editing its own profile isn't built).
- **Comments/testimonials are hand-seeded**, not a real submission system.

## Suggested next steps

1. Wire up Stripe for the four paid products in `/pricing`.
2. Add authentication for business owners to claim and edit their own listing (the `businesses.owner_id` column already exists for this).
3. Replace the placeholder photo colour blocks with real image handling (Supabase Storage).
4. Write real copy for `/about` and decide the scope of `/whats-on`.
5. Wire the Today/This week/This month toggle to real vote timestamps.

## A note on the pricing figures

The numbers on `/pricing` (£25/week category slots, £50/week homepage slots, £150/month category sponsorship, £75 featured upgrade, £99 founding membership) were suggested starting points from the original design conversation, not confirmed final pricing. Sanity-check them against real Wiltshire businesses before launch.
