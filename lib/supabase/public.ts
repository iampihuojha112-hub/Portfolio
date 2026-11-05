import { createClient } from "@supabase/supabase-js";

/** Anonymous, cookie-free client. Safe to use inside cached functions; sees published rows only. */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
