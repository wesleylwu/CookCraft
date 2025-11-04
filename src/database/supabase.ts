import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-key",
);

export const isSupabaseConfigured = () => {
  const hasUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (hasUrl && hasKey) {
    return true;
  }

  return false;
};
