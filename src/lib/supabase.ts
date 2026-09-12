import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — copy .env.example to .env.local and fill them in."
  );
}

// This client uses the publishable (anon) key, so it's safe to import from
// both Server and Client Components — every table it touches must have Row
// Level Security policies written for it, since it carries no special
// privilege of its own. A separate service-role client (server-only, never
// imported into client code) gets added later for the admin queue.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
