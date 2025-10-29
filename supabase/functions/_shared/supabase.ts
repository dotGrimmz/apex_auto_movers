import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from "./config.ts";

type SupabaseClientOptions = Parameters<typeof createClient>[2];

function createClientWithHeaders<TDatabase = any>(
  apiKey: string,
  req?: Request,
  options?: SupabaseClientOptions
): SupabaseClient<TDatabase> {
  const headers: Record<string, string> = {};
  if (req) {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
  }
  return createClient<TDatabase>(SUPABASE_URL!, apiKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers,
    },
    ...options,
  });
}

export function createAdminClient<TDatabase = any>(req?: Request) {
  return createClientWithHeaders<TDatabase>(SUPABASE_SERVICE_ROLE_KEY!, req);
}

export function createAnonClient<TDatabase = any>(req?: Request) {
  return createClientWithHeaders<TDatabase>(SUPABASE_ANON_KEY!, req);
}
