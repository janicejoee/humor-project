import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qihsgnfjqmkjmoowyfbn.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;

let instance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (instance) return instance;
  if (!supabaseKey) {
    throw new Error(
      "Missing SUPABASE_KEY. Add it to .env.local (or Vercel env vars for production)."
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
