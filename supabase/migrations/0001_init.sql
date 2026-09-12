-- Discover Wiltshire — initial schema
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).
--
-- Design notes:
--   * businesses.id / categories.id are plain text slugs (e.g. 'old-forge-kitchen',
--     'eat-drink'), matching the ids already used throughout the app and its URLs —
--     no separate UUID + slug split needed.
--   * A business's live vote count is `seed_votes + (real vote rows)`, exactly
--     mirroring the old localStorage store's `business.votes + deltas[id]` model —
--     see the business_vote_counts view below.
--   * Real vote timestamps (votes.created_at) finally make the "Today / This week /
--     This month" toggle buildable — it was an admitted cosmetic placeholder before,
--     since it needs vote timestamps that only a real backend can provide.
--   * New listings land in `businesses` with status='pending' rather than a separate
--     table — approving one is just flipping status to 'approved'. Promoted-slot and
--     founding-member purchases are requests *against* an existing business, so they
--     get their own `upgrade_requests` table instead.
--   * Every table has Row Level Security on. The publishable (anon) key used by the
--     browser can only do what these policies explicitly allow — notably, it can
--     insert new listings and votes, but it cannot read pending businesses or
--     upgrade requests. The admin queue will need the service-role key from a
--     server-side route once that's built, which is a real fix for the prototype's
--     "admin queue has no authentication" gap, not just a UI hide.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

create table categories (
  id text primary key,
  label text not null,
  category_group text not null check (category_group in ('core', 'trade')),
  sort_order integer not null default 0
);

alter table categories enable row level security;

create policy "categories are publicly readable"
  on categories for select
  using (true);

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------

create table businesses (
  id text primary key,
  name text not null,
  category_id text not null references categories(id),
  tagline text not null,
  description text not null default '',
  location text not null default '',
  price_range text not null default '',
  phone text not null default '',
  website text not null default '#',
  photo_color text not null default '#D9C7A3',
  seed_votes integer not null default 0,
  promoted boolean not null default false,
  featured boolean not null default false,
  founding_member boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  owner_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index businesses_category_id_idx on businesses(category_id);
create index businesses_status_idx on businesses(status);

alter table businesses enable row level security;

create policy "approved businesses are publicly readable"
  on businesses for select
  using (status = 'approved');

create policy "anyone can submit a new listing"
  on businesses for insert
  with check (status = 'pending');

-- No public update/delete policy: approving, declining, or editing a listing
-- happens server-side with the service-role key once the admin queue exists.

-- ---------------------------------------------------------------------------
-- votes
-- ---------------------------------------------------------------------------

create table votes (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references businesses(id) on delete cascade,
  voter_id text not null,
  created_at timestamptz not null default now(),
  unique (business_id, voter_id)
);

create index votes_business_id_idx on votes(business_id);
create index votes_created_at_idx on votes(created_at);

alter table votes enable row level security;

create policy "anyone can vote once per business"
  on votes for insert
  with check (true);

-- No public select policy on the raw table — individual votes aren't exposed
-- (which anonymous voter voted for what stays private). Live counts are read
-- through the aggregate view below instead.

create view business_vote_counts as
  select
    b.id as business_id,
    b.seed_votes + count(v.id) as total_votes
  from businesses b
  left join votes v on v.business_id = b.id
  group by b.id, b.seed_votes;

grant select on business_vote_counts to anon, authenticated;

-- ---------------------------------------------------------------------------
-- upgrade_requests — promoted-slot / founding-member purchases against an
-- existing business, reviewed in the admin queue alongside pending listings.
-- ---------------------------------------------------------------------------

create table upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references businesses(id) on delete cascade,
  request_type text not null check (request_type in ('promoted-slot', 'founding-member')),
  detail text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now()
);

alter table upgrade_requests enable row level security;

create policy "anyone can request an upgrade"
  on upgrade_requests for insert
  with check (status = 'pending');

-- No public select policy — reviewed via the admin queue (service-role key).

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references businesses(id) on delete cascade,
  name text not null,
  quote text not null,
  created_at timestamptz not null default now()
);

create index testimonials_business_id_idx on testimonials(business_id);

alter table testimonials enable row level security;

create policy "testimonials are publicly readable"
  on testimonials for select
  using (true);

-- No public insert policy yet — hand-seeded for now, same as the prototype;
-- a real submission flow is future work.

-- ---------------------------------------------------------------------------
-- category_sponsors
-- ---------------------------------------------------------------------------

create table category_sponsors (
  category_id text primary key references categories(id),
  sponsor_name text not null
);

alter table category_sponsors enable row level security;

create policy "category sponsors are publicly readable"
  on category_sponsors for select
  using (true);

-- ---------------------------------------------------------------------------
-- events ("what's on")
-- ---------------------------------------------------------------------------

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  when_text text not null
);

alter table events enable row level security;

create policy "events are publicly readable"
  on events for select
  using (true);

-- ---------------------------------------------------------------------------
-- Seed data — ports the existing seed content from src/lib/data.ts so the
-- site looks identical once wired to Supabase instead of localStorage.
-- ---------------------------------------------------------------------------

insert into categories (id, label, category_group, sort_order) values
  ('eat-drink', 'Eat & drink', 'core', 1),
  ('stay', 'Stay', 'core', 2),
  ('things-to-do', 'Things to do', 'core', 3),
  ('shops', 'Shops', 'core', 4),
  ('painters', 'Painters & decorators', 'trade', 10),
  ('plumbers', 'Plumbers', 'trade', 11),
  ('electricians', 'Electricians', 'trade', 12),
  ('builders', 'Builders', 'trade', 13),
  ('roofers', 'Roofers', 'trade', 14),
  ('carpenters', 'Carpenters & joiners', 'trade', 15),
  ('plasterers', 'Plasterers', 'trade', 16),
  ('tilers', 'Tilers', 'trade', 17),
  ('flooring', 'Flooring fitters', 'trade', 18),
  ('kitchen-fitters', 'Kitchen fitters', 'trade', 19),
  ('bathroom-fitters', 'Bathroom fitters', 'trade', 20),
  ('gardeners', 'Gardeners & landscapers', 'trade', 21),
  ('tree-surgeons', 'Tree surgeons', 'trade', 22),
  ('cleaners', 'Cleaners', 'trade', 23),
  ('window-cleaners', 'Window cleaners', 'trade', 24),
  ('locksmiths', 'Locksmiths', 'trade', 25),
  ('handymen', 'Handymen', 'trade', 26),
  ('removals', 'Removals', 'trade', 27),
  ('pest-control', 'Pest control', 'trade', 28),
  ('driveways', 'Driveways & paving', 'trade', 29),
  ('accountants', 'Accountants', 'trade', 30),
  ('solicitors', 'Solicitors', 'trade', 31),
  ('financial-advisers', 'Financial advisers', 'trade', 32),
  ('estate-agents', 'Estate agents', 'trade', 33),
  ('vets', 'Vets', 'trade', 34),
  ('dentists', 'Dentists', 'trade', 35),
  ('hairdressers', 'Hairdressers & barbers', 'trade', 36),
  ('beauty-salons', 'Beauty salons', 'trade', 37),
  ('driving-instructors', 'Driving instructors', 'trade', 38),
  ('photographers', 'Photographers', 'trade', 39);

insert into businesses (id, name, category_id, tagline, description, location, price_range, phone, website, photo_color, seed_votes, promoted, featured, founding_member, status) values
  ('old-forge-kitchen', 'The Old Forge Kitchen', 'eat-drink', 'seasonal menu, chef''s table Fridays', 'A proper seasonal menu that changes with what''s good that week, plus a chef''s table on Fridays if you want to watch it happen. Booking ahead is worth it — this one fills up fast.', 'Marlborough', '££', '01672 000000', '#', '#D9C7A3', 142, true, false, true, 'approved'),
  ('the-bell-ramsbury', 'The Bell, Ramsbury', 'eat-drink', 'proper Sunday roasts, dog-friendly', 'A village pub that takes its Sunday roasts seriously. Dogs welcome, log fire in winter, and a beer garden worth lingering in come summer.', 'Ramsbury', '££', '01672 000001', '#', '#C9CFB5', 128, false, false, false, 'approved'),
  ('wilton-yard-studios', 'Wilton Yard Studios', 'things-to-do', 'weekend pottery classes, all levels', 'Hands-on pottery classes every weekend, taught by working local potters. No experience needed, and you take home what you make.', 'Wilton', '£', '01722 000000', '#', '#B9C2CC', 94, false, true, false, 'approved'),
  ('barn-coombe-farm', 'Barn at Coombe Farm', 'stay', 'stays with a view, sleeps 6', 'A converted barn with views across the valley, sleeps up to six. Fires lit for you on arrival in the colder months.', 'Coombe Bissett', '£££', '01722 000001', '#', '#DCC3A9', 81, false, false, false, 'approved'),
  ('chalk-and-vine', 'Chalk & Vine Wine Bar', 'eat-drink', 'local wines, small plates, live jazz Thursdays', 'A small, warm wine bar with an English-leaning list and small plates built to share. Live jazz most Thursdays.', 'Devizes', '££', '01380 000000', '#', '#E4D2B0', 63, false, true, false, 'approved'),
  ('devizes-outdoor-co', 'Devizes Outdoor Co', 'shops', 'walking gear, maps, and local advice', 'Proper walking and camping gear, plus the best local trail advice you will get from anyone behind a till.', 'Devizes', '££', '01380 000001', '#', '#C7B79E', 51, false, false, false, 'approved'),
  ('wren-and-willow', 'Wren & Willow', 'shops', 'handmade gifts and local crafts', 'A small shop stocking makers from across the county — pottery, textiles, and cards you will not find on the high street.', 'Marlborough', '£', '01672 000002', '#', '#E8DCC4', 44, false, false, false, 'approved'),
  ('the-vine-marlborough', 'The Vine', 'eat-drink', 'live folk night every Friday', 'A proper local with a live folk session every Friday night and a decent range of local ales on tap.', 'Marlborough', '£', '01672 000003', '#', '#CBB9E0', 39, false, false, false, 'approved'),
  ('salisbury-rowing-club', 'Salisbury Rowing Club', 'things-to-do', 'taster sessions on the Avon', 'Beginner taster sessions on the river Avon most weekends — no experience needed, all kit provided.', 'Salisbury', '£', '01722 000002', '#', '#A9C4D8', 33, false, false, false, 'approved'),
  ('meadow-view-bandb', 'Meadow View B&B', 'stay', 'quiet rooms, big breakfasts', 'A quiet, family-run B&B just outside Devizes, known locally for breakfasts that will set you up for the day.', 'Devizes', '££', '01380 000002', '#', '#D8CBB0', 28, false, false, false, 'approved'),
  ('kennet-valley-decorators', 'Kennet Valley Decorators', 'painters', 'interior & exterior, free quotes', 'A small local team doing interior and exterior painting across the Kennet valley. Free, no-obligation quotes, and they clean up properly after themselves.', 'Marlborough', '££', '01672 000010', '#', '#EADFC8', 37, false, false, false, 'approved'),
  ('downland-plumbing', 'Downland Plumbing & Heating', 'plumbers', '24/7 call-outs, boiler servicing', 'Gas Safe registered, with a genuine 24/7 call-out line for the burst-pipe emergencies as well as routine boiler servicing.', 'Devizes', '££', '01380 000010', '#', '#C4D3DC', 45, false, true, false, 'approved'),
  ('wessex-electrical', 'Wessex Electrical Services', 'electricians', 'NICEIC registered, rewires & EV chargers', 'NICEIC-registered electricians covering everything from full rewires to EV charger installs. Certificates provided on every job.', 'Salisbury', '££', '01722 000010', '#', '#D9D2C3', 31, false, false, false, 'approved'),
  ('chalke-valley-accountancy', 'Chalke Valley Accountancy', 'accountants', 'sole traders & small business specialists', 'A small practice that specialises in sole traders and small local businesses — self-assessment, bookkeeping, and straightforward advice.', 'Wilton', '£££', '01722 000011', '#', '#CBD6C6', 22, false, false, false, 'approved'),
  ('avonbank-builders', 'Avonbank Builders', 'builders', 'extensions, renovations, loft conversions', 'A family building firm handling extensions, renovations, and loft conversions across the county, with references available for every recent job.', 'Chippenham', '£££', '01249 000010', '#', '#DCC9B0', 19, false, false, false, 'approved'),
  ('greenhedge-gardens', 'Greenhedge Gardens', 'gardeners', 'garden design & regular maintenance', 'Garden design and regular maintenance rounds, from a single tidy-up to a full replanting. Happy to work to a seasonal schedule.', 'Pewsey', '££', '01672 000011', '#', '#C3D0A8', 15, false, false, false, 'approved');

insert into testimonials (business_id, name, quote) values
  ('old-forge-kitchen', 'Hannah, Marlborough', 'The chef''s table is worth every penny, best meal we''ve had locally this year.'),
  ('old-forge-kitchen', 'Tom, Pewsey', 'Menu changes often enough that it''s never boring going back.'),
  ('the-bell-ramsbury', 'Sam, Ramsbury', 'Our regular Sunday spot, never disappoints.'),
  ('wilton-yard-studios', 'Priya, Salisbury', 'Went as a total beginner, left with a bowl I actually use.');

insert into category_sponsors (category_id, sponsor_name) values
  ('eat-drink', 'Kennet Valley Brewery');

insert into events (name, when_text) values
  ('Devizes farmers'' market', 'Sat, 9am'),
  ('Live folk night, The Vine', 'Fri, 8pm');
