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
| `/business/[id]` | Individual business profile page, laid out like a map-listing profile: title with Share, upvote count and category rank, tags, action buttons (Upvote, Directions, Call, Website), photos, About, "what people are saying", and a column of cards (Find us, At a glance, More in this category, upcoming events in its town). Styles in `src/components/business/business.css`. There's no stored data for opening hours, amenities or star ratings, so those sections aren't shown; the photo tiles are still colour-block placeholders |
| `/list-your-business` | Free listing submission form, with an optional founding-membership add-on |
| `/pricing` | Pricing copy for all revenue lines (promoted slots, category and town sponsorship, featured upgrade, founding membership) |
| `/admin`, `/admin/businesses`, `/admin/businesses/[id]/edit` | Approval queue and business editor — real Supabase Auth login required, gated by `src/proxy.ts` and re-checked in every Server Action |
| `/admin/categories`, `/admin/events`, `/admin/sponsors` | Manage trade categories, the events calendar, and the sponsor shown on each category/town page (image upload goes to the public `sponsor-images` Storage bucket) |
| `/admin/journal`, `/admin/journal/new`, `/admin/journal/[id]/edit` | Write and manage Journal entries: Markdown editor with toolbar, live preview and inline image upload (to the public `journal-images` bucket), drafts, and scheduling by setting a future publish date |
| `/journal`, `/journal/[slug]` | The Journal (formerly "Our story" at `/about`, which redirects here). The index is a filterable card grid with "Load more"; an **article** has its own page (sticky title column beside the article, share buttons, related entries), a **news** card links out to another site. `/journal?category=…` and `?type=news` are shareable filtered views |
| `/signup`, `/login`, `/account`, `/members/[name]` | Members: create an account (display name, email, password, email confirmation), sign in, an account page (edit your bio, see and delete your own reviews with their approval status) and a public profile listing a member's approved reviews. The header shows "Sign in" or the member's initials. See "Members and reviews" below for the one-off setup |
| `/terms`, `/privacy` | **Draft** terms of use and privacy notice written to match how the site works — they need a legal check and a contact email adding before launch |
| `/admin/reviews`, `/admin/members` | Approve or decline new reviews, handle reports on live reviews, and ban/unban members from posting |
| `/whats-on`, `/whats-on/add` | The events calendar and its public submission form (events are approved in `/admin`). One event can hold the **featured / sponsored banner slot** at the top of `/whats-on`: a big image card with dates, venue and a button, labelled "Sponsored" or "Featured". Set it in `/admin/events` → Edit → "Featured slot" (only one at a time; it stays up until its last day). Needs `supabase/migrations/0008_featured_event.sql`, which also adds Longleat's Spooktacular Adventures (24 Oct – 1 Nov 2026) as the first one; until it's run the page simply shows no banner |

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

## Members and reviews

Members use Supabase Auth (the same system as the admin login; admin access is still decided only by `ADMIN_EMAIL`). Reviews are star-rated, written by signed-in members, and **held as pending until approved in `/admin/reviews`** — the database only ever shows the public approved ones. Members can report a live review; reports appear in the same admin screen. Until the migration below has been run the site still works: review sections just show "No reviews yet" and the account/admin pages explain what's missing.

One-off setup:

1. Run `supabase/migrations/0007_members_reviews.sql` in the Supabase SQL Editor. It adds `profiles` (created automatically at sign-up, and backfilled for existing accounts), `reviews`, the `business_review_stats` view and `content_reports`, all with row-level security.
2. Supabase → Authentication → **Providers → Email**: keep **Confirm email** switched on.
3. Supabase → Authentication → **URL Configuration**: set the Site URL to the live address and add `https://<your-domain>/auth/callback` to Redirect URLs (add `http://localhost:3000/auth/callback` for local testing). The confirmation email lands there.
4. Supabase's built-in email sender is limited to a few emails an hour. Before real sign-ups, add a proper sender under Authentication → **SMTP Settings** (Resend or Postmark on your own domain).
5. Fill in the contact details marked `[Add …]` in `/terms` and `/privacy` and have both checked by someone qualified.

Rules worth knowing: one review per member per business; a member can write at most 5 reviews a day (enforced by a database trigger); display names are unique and can't be changed by the member; deleting a review (or an auth user) removes it straight away.

## Light and dark themes

Every public page has a light and a dark version, switched with the **Light / Dark** toggle in the footer. Dark is the default; the choice is remembered in the browser (`localStorage` key `dw-theme`) and applied by a tiny inline script in `src/app/layout.tsx` before the page paints, so there's no flash of the wrong theme. The admin area isn't themed.

How it works: the shell's colours are named variables in `src/components/home/home.css` — dark values on `.ph-home`, light values on `html[data-theme="light"] .ph-home`. Shared site tokens (`--bg`, `--ink`, `--border`…) are re-pointed in the same two blocks, so most components follow automatically. **When writing new styles inside the shell, use these variables (`--ph-card`, `--ph-text`, `--ph-line`, `--ph-link`, `--ph-hover`…) rather than literal colours**, or the light theme will show it.

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
