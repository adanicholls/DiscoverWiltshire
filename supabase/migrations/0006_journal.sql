-- ---------------------------------------------------------------------------
-- journal_entries - the Journal (/journal): a filterable grid of cards, each
-- either an ARTICLE (has its own page at /journal/<slug>) or NEWS (a card
-- whose headline links out to somewhere else, e.g. a press mention).
--
-- Written and managed from /admin/journal. The article body is Markdown,
-- rendered by the site; images are uploaded to the journal-images bucket
-- below.
--
-- Visibility is enforced here, not just in the app: the public (anon) role
-- can only read entries that are 'published' AND whose published_at has
-- arrived - so a draft can never leak through the API, and setting a future
-- date schedules an entry. All writes go through the admin area with the
-- service-role key (there is deliberately no public insert/update/delete
-- policy).
-- ---------------------------------------------------------------------------

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  -- The entry's address: /journal/<slug>. Lowercase words joined by hyphens.
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  entry_type text not null default 'article' check (entry_type in ('article', 'news')),
  -- For news this is the blurb shown on the card (it is the whole headline).
  title text not null,
  -- Free text; the filter pills on /journal are built from whatever
  -- categories published entries use. Blank = no category.
  category text not null default '',
  -- Short summary: the page description for search engines and sharing.
  excerpt text not null default '',
  -- Markdown. Unused for news.
  body text not null default '',
  -- Public URL of the card / header image in the journal-images bucket.
  cover_url text not null default '',
  author_name text not null default '',
  -- News only: where the card links to, and what its button says.
  external_url text not null default '',
  cta_label text not null default 'Read article',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_entries_published_idx
  on journal_entries (published_at desc)
  where status = 'published';

alter table journal_entries enable row level security;

create policy "published journal entries are publicly readable"
  on journal_entries for select
  using (status = 'published' and published_at <= now());

grant select on journal_entries to anon, authenticated;

-- Where journal images live (card/header images, and images placed inside
-- article bodies). Public so pages can load them by plain URL; uploads and
-- deletes only ever happen from the admin area with the service-role key.
-- Size and type limits are enforced here as well as in the admin action.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'journal-images',
  'journal-images',
  true,
  3145728,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
