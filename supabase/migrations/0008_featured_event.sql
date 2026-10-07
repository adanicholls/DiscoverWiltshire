-- ---------------------------------------------------------------------------
-- Featured / sponsored event: one event that gets the big banner slot at the
-- top of /whats-on, above the month-by-month list.
--
-- Set from /admin/events -> Edit. Only one event can be featured at a time
-- (the partial unique index below enforces that, so the admin action clears
-- the old one first). A featured event stays in its slot while it is on - it
-- is shown until `ends_at` (or its start, for a one-day event), after which it
-- falls away on its own.
--
-- `sponsor_label` is the word shown on the card ("Sponsored" for a paid
-- placement, "Featured" for an editorial pick) so paid placements are always
-- labelled as such.
--
-- No policy changes are needed: the existing "approved events are publicly
-- readable" policy already covers the new columns.
-- ---------------------------------------------------------------------------

alter table events
  add column featured boolean not null default false,
  add column ends_at timestamptz,
  add column image_url text not null default '',
  add column sponsor_label text not null default 'Featured',
  add column cta_label text not null default 'Find out more';

create unique index events_one_featured_idx on events (featured) where featured;

-- The first sponsored event: Longleat's half-term Spooktacular Adventures.
-- Dates are UK time (24 October - 1 November 2026). The image is served from
-- Longleat's own media library; change the address in /admin/events -> Edit
-- if you'd rather host a copy yourself.
insert into events (
  name, description, starts_at, ends_at, venue, town_id, website, price_text,
  photo_color, image_url, sponsor_label, cta_label, featured, status
) values (
  'Spooktacular Adventures',
  'Shaun the Sheep and the flock take over Longleat this half term. Help stop the pumpkins crashing the Halloween Hoedown with a trail of puzzles, farmyard games, barn dancing and live music - all included in your day ticket, alongside the Safari and Boat Safari.',
  timestamp '2026-10-24 09:00:00' at time zone 'Europe/London',
  timestamp '2026-11-01 23:59:00' at time zone 'Europe/London',
  'Longleat',
  'warminster',
  'https://www.longleat.co.uk/events/spooktacular-adventures',
  'Included with a day ticket or membership',
  '#E9A23B',
  'https://media.umbraco.io/longleat-cheddar/i2rfbx3n/web_event_header_1920x1080px_07_2026_sprint12_octoberhalfterm-1-1.jpg',
  'Sponsored',
  'Book tickets',
  true,
  'approved'
);
