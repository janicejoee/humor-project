import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://qihsgnfjqmkjmoowyfbn.supabase.co";
// Anon key must be public for client-side; use same value as SUPABASE_KEY
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to .env.local (use the same value as SUPABASE_KEY for auth)."
  );
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey as string);
}
