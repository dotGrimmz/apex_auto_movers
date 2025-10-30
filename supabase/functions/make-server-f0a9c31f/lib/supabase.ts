import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";
import { getConfig } from "./env.ts";

let adminClient: SupabaseClient | null = null;
let anonClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;
  const { supabaseUrl, supabaseServiceKey } = getConfig();
  adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

export function getAnonClient(): SupabaseClient {
  if (anonClient) return anonClient;
  const { supabaseUrl, supabaseAnonKey } = getConfig();
  anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return anonClient;
}

export async function getUserFromToken(token?: string | null): Promise<User | null> {
  if (!token) return null;
  const admin = getAdminClient();
  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch (error) {
    console.error("[auth] Failed to fetch user from token", error);
    return null;
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const admin = getAdminClient();
  try {
    const { data, error } = await admin.rpc("is_admin", { uid: userId });
    if (error) {
      console.error("[auth] is_admin RPC failed", error);
      return false;
    }
    return Boolean(data);
  } catch (error) {
    console.error("[auth] is_admin RPC exception", error);
    return false;
  }
}
