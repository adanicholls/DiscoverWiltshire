-- Discover Wiltshire — towns
--
-- Adds a town hub system alongside the existing category system: a
-- `towns` table (same pattern as `categories`) and a `town_id` column on
-- businesses for broad geographic grouping/filtering. This is separate
-- from the free-text `location` column, which stays as the precise,
-- business-entered place name (e.g. "Coombe Bissett") shown on its
-- profile - `town_id` is the nearest major town, used for hub pages and
-- the location filter, and picked from a fixed list rather than typed.

create table towns (
  id text primary key,
  label text not null,
  sort_order integer not null default 0
);

alter table towns enable row level security;

create policy "towns are publicly readable"
  on towns for select
  using (true);

insert into towns (id, label, sort_order) values
  ('salisbury', 'Salisbury', 1),
  ('trowbridge', 'Trowbridge', 2),
  ('chippenham', 'Chippenham', 3),
  ('devizes', 'Devizes', 4),
  ('marlborough', 'Marlborough', 5),
  ('warminster', 'Warminster', 6),
  ('westbury', 'Westbury', 7),
  ('melksham', 'Melksham', 8),
  ('calne', 'Calne', 9),
  ('amesbury', 'Amesbury', 10),
  ('bradford-on-avon', 'Bradford-on-Avon', 11),
  ('corsham', 'Corsham', 12),
  ('malmesbury', 'Malmesbury', 13),
  ('royal-wootton-bassett', 'Royal Wootton Bassett', 14),
  ('tidworth', 'Tidworth', 15),
  ('pewsey', 'Pewsey', 16);

alter table businesses add column town_id text references towns(id);
create index businesses_town_id_idx on businesses(town_id);

-- Back-fill the existing seed businesses to their nearest major town.
update businesses set town_id = 'marlborough' where id in ('old-forge-kitchen', 'the-bell-ramsbury', 'wren-and-willow', 'the-vine-marlborough', 'kennet-valley-decorators');
update businesses set town_id = 'salisbury' where id in ('wilton-yard-studios', 'barn-coombe-farm', 'salisbury-rowing-club', 'wessex-electrical', 'chalke-valley-accountancy');
update businesses set town_id = 'devizes' where id in ('chalk-and-vine', 'devizes-outdoor-co', 'meadow-view-bandb', 'downland-plumbing');
update businesses set town_id = 'chippenham' where id in ('avonbank-builders');
update businesses set town_id = 'pewsey' where id in ('greenhedge-gardens');
