import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qihsgnfjqmkjmoowyfbn.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error(
    "Missing SUPABASE_KEY. Add it to .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
