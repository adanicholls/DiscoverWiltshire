-- ---------------------------------------------------------------------------
-- events ("what's on") — upgrade from a two-column placeholder (name +
-- loose "Sat, 9am" text) to a real, admin-approved events calendar.
-- Mirrors the businesses submission flow exactly: anyone can submit an
-- event (status='pending'), and it only shows publicly once an admin
-- approves it from the queue at /admin.
-- ---------------------------------------------------------------------------

-- The two seed rows are just placeholder demo content with no real date to
-- migrate - clearing them out and reseeding under the new schema below is
-- simpler and safer than trying to backfill a real timestamp from free text.
delete from events;

alter table events
  add column description text not null default '',
  add column starts_at timestamptz not null,
  add column venue text not null default '',
  add column town_id text references towns(id),
  add column website text not null default '',
  add column price_text text not null default '',
  add column photo_color text not null default '#D9C7A3',
  add column status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  add column created_at timestamptz not null default now();

alter table events drop column when_text;

create index events_starts_at_idx on events(starts_at);
create index events_status_idx on events(status);

drop policy "events are publicly readable" on events;

create policy "approved events are publicly readable"
  on events for select
  using (status = 'approved');

create policy "anyone can submit a new event"
  on events for insert
  with check (status = 'pending');

-- No public update/delete policy: approving, declining, or editing an event
-- happens server-side with the service-role key, same as businesses.

grant insert on events to anon;

-- Re-seed two example events under the new schema, dated a couple of weeks
-- out so they show up as upcoming regardless of when this migration runs.
insert into events (name, description, starts_at, venue, town_id, website, price_text, photo_color, status) values
  ('Devizes farmers'' market', 'Local produce, bread, and crafts on the market place, every Saturday morning.', now() + interval '9 days', 'Market Place', 'devizes', '#', 'Free entry', '#CBD6C6', 'approved'),
  ('Live folk night, The Vine', 'A regular Friday night folk session - open to anyone who wants to join in.', now() + interval '15 days', 'The Vine', 'marlborough', '#', '£5 on the door', '#D9C7A3', 'approved');
