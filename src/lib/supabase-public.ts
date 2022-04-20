import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Publishable-key Supabase client for use inside server function handlers.
 * Only reads data covered by public (anon) read policies.
 */
export function createPublicServerClient(): SupabaseClient {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
