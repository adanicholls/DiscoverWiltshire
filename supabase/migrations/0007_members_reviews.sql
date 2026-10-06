-- ---------------------------------------------------------------------------
-- Members, business reviews and content reports.
--
-- Members sign up with Supabase Auth (email + password). Each auth user gets
-- a row in `profiles` automatically (see the trigger below) carrying a public
-- display name and short bio. The admin account (ADMIN_EMAIL) is just another
-- auth user as far as this schema is concerned - admin access is decided in
-- the app, never by anything here.
--
-- Reviews are written by signed-in members and are held as 'pending' until
-- approved from /admin/reviews. The public (anon) role can only ever read
-- approved reviews, enforced here by row-level security rather than relying on
-- the app to filter. All moderation writes go through the admin area with the
-- service-role key (there is deliberately no policy letting a member change a
-- review's status).
--
-- IMPORTANT: for sign-up to be safe, keep "Confirm email" switched ON in
-- Supabase -> Authentication -> Providers -> Email, so an address has to be
-- proven before it can post anything.
-- ---------------------------------------------------------------------------

-- Profiles --------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null
    check (char_length(display_name) between 3 and 30 and display_name ~ '^[A-Za-z0-9][A-Za-z0-9 _.-]*$'),
  bio text not null default '' check (char_length(bio) <= 300),
  -- Set from the admin area. A banned member can still sign in and read, but
  -- every "write" policy below requires is_active_member().
  banned boolean not null default false,
  created_at timestamptz not null default now()
);

-- Display names are unique regardless of capitalisation, so nobody can pose
-- as "Sarah" with a lookalike "sarah".
create unique index profiles_display_name_key on profiles (lower(display_name));

alter table profiles enable row level security;

create policy "profiles are publicly readable"
  on profiles for select
  using (true);

-- A member can edit their own bio (and only that - see the column grants).
create policy "members can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Column-level grants keep `banned` out of the public API entirely.
grant select (id, display_name, bio, created_at) on profiles to anon, authenticated;
grant update (bio) on profiles to authenticated;

-- Creates the profile when someone signs up. The sign-up form passes the
-- chosen name as user metadata; if it's missing, invalid or already taken we
-- fall back to a generated "member1a2b3c4d" name rather than failing the
-- sign-up (the member can't change it later, but it is only a fallback).
create function handle_new_user() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wanted text := btrim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  fallback text := 'member' || substr(replace(new.id::text, '-', ''), 1, 8);
begin
  begin
    insert into profiles (id, display_name) values (new.id, wanted);
  exception when others then
    insert into profiles (id, display_name) values (new.id, fallback);
  end;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Anyone who already has an account (e.g. the admin login) gets a profile
-- too, with a generated name. Change it by hand if you'd like something
-- friendlier:  update profiles set display_name = 'Adam' where id = '<user id>';
insert into profiles (id, display_name)
select u.id, 'member' || substr(replace(u.id::text, '-', ''), 1, 8)
from auth.users u
on conflict (id) do nothing;

-- True for a signed-in, not-banned member. Used by every write policy.
create function is_active_member() returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and not p.banned);
$$;

grant execute on function is_active_member() to authenticated;

-- Reviews ---------------------------------------------------------------

create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Copied from the member's profile when the review is written, so the
  -- public list never has to join to profiles.
  author_name text not null default '',
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(btrim(body)) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  -- One review per member per business.
  unique (business_id, user_id)
);

create index reviews_business_idx on reviews (business_id, created_at desc) where status = 'approved';
create index reviews_user_idx on reviews (user_id, created_at desc);

alter table reviews enable row level security;

create policy "approved reviews are publicly readable"
  on reviews for select
  using (status = 'approved');

create policy "members can read their own reviews"
  on reviews for select
  using (auth.uid() = user_id);

create policy "active members can write a pending review"
  on reviews for insert
  with check (auth.uid() = user_id and status = 'pending' and is_active_member());

create policy "members can delete their own reviews"
  on reviews for delete
  using (auth.uid() = user_id);

grant select on reviews to anon, authenticated;
grant insert (business_id, user_id, rating, body, status) on reviews to authenticated;
grant delete on reviews to authenticated;

-- Stamps the author's display name on a new review and stops a member
-- flooding the queue (max 5 reviews a day).
create function prepare_review() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select display_name into new.author_name from profiles where id = new.user_id;
  if (select count(*) from reviews where user_id = new.user_id and created_at > now() - interval '1 day') >= 5 then
    raise exception 'You''ve written a lot of reviews today - please try again tomorrow.';
  end if;
  return new;
end;
$$;

create trigger reviews_prepare
  before insert on reviews
  for each row execute function prepare_review();

-- Average rating and count per business, over approved reviews only. Same
-- pattern as business_vote_counts: a view readable by everyone.
create view business_review_stats as
  select business_id, count(*)::int as review_count, round(avg(rating)::numeric, 1) as avg_rating
  from reviews
  where status = 'approved'
  group by business_id;

grant select on business_review_stats to anon, authenticated;

-- Reports -----------------------------------------------------------------
-- "Report this" on a review. Members can file reports but not read them; the
-- admin area reads them with the service-role key. Filing the same report
-- twice is ignored (unique constraint). target_type is there so other kinds of
-- content can be added later with a one-line change to the check.

create table content_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('review')),
  target_id uuid not null,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(btrim(reason)) between 3 and 500),
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (target_type, target_id, reporter_id)
);

alter table content_reports enable row level security;

create policy "active members can file reports"
  on content_reports for insert
  with check (auth.uid() = reporter_id and resolved = false and is_active_member());

grant insert (target_type, target_id, reporter_id, reason) on content_reports to authenticated;
