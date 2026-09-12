-- Discover Wiltshire — table grants for the anon role
--
-- Row Level Security policies control WHICH rows a role can touch, but
-- Postgres also needs the base SQL-level privilege granting THAT the role
-- may attempt the operation at all — a policy with no grant behind it does
-- nothing. Supabase grants SELECT on new tables to anon/authenticated by
-- default, which is why reads already worked; INSERT needs granting
-- explicitly for the tables the public (anon) client is allowed to write to.

grant insert on businesses to anon;
grant insert on votes to anon;
grant insert on upgrade_requests to anon;
