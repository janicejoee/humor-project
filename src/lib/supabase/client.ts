import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let instance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (instance) return instance;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (or Vercel env vars for production)."
    );
  }
  instance = createClient(supabaseUrl, supabaseKey);
  return instance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as unknown as Record<string, unknown>)[prop as string];
  },
});
