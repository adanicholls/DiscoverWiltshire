-- ---------------------------------------------------------------------------
-- sponsorships - the image-led "Sponsored" card shown at the top of a
-- category page or a town page (see SponsorCard). Replaces the old
-- category_sponsors table (which nothing in the app ever read - the Eat &
-- drink banner was a hardcoded constant) with one table that covers both
-- categories and towns and carries enough to render a real ad: an image, a
-- headline, and a link.
--
-- One sponsor per category / per town at a time, matching what /pricing
-- promises - enforced by the unique constraint. Changing sponsor = editing
-- the row (or deleting it and adding a new one) from /admin/sponsors.
--
-- target_id is a category id or a town id depending on target_type. It has
-- no foreign key because it points at two different tables; the admin
-- action checks it exists before saving.
-- ---------------------------------------------------------------------------

create table sponsorships (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('category', 'town')),
  target_id text not null,
  sponsor_name text not null,
  headline text not null default '',
  website text not null default '',
  -- Public URL of the uploaded creative in the sponsor-images bucket below.
  -- Empty = no image yet; the card falls back to a coloured tile showing the
  -- sponsor's initial, using photo_color.
  image_url text not null default '',
  photo_color text not null default '#D9C7A3',
  created_at timestamptz not null default now(),
  unique (target_type, target_id)
);

alter table sponsorships enable row level security;

-- Sponsor cards are public by nature. There is deliberately no public
-- insert/update/delete policy: all changes go through the admin area with
-- the service-role key.
create policy "sponsorships are publicly readable"
  on sponsorships for select
  using (true);

grant select on sponsorships to anon, authenticated;

-- Where uploaded sponsor images live. Public, so the card can load them by
-- plain URL; uploads and deletes only ever happen from the admin area with
-- the service-role key (no storage policies are created for anyone else).
-- Size and type limits are enforced here as well as in the admin action.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sponsor-images',
  'sponsor-images',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Carry over the existing demo sponsor (Eat & drink) so that page doesn't
-- lose its sponsor when the hardcoded banner is removed. The old
-- category_sponsors table is left in place, now unused.
insert into sponsorships (target_type, target_id, sponsor_name)
select 'category', category_id, sponsor_name from category_sponsors;
