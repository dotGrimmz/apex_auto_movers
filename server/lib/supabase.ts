import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process?.env?.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_KEY = process?.env?.SUPABASE_SERVICE_ROLE_KEY as string;
const ANON_KEY = process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!SERVICE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
if (!ANON_KEY) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const createAdminClient = () => createClient(SUPABASE_URL, SERVICE_KEY);
export const createAnonClient = () => createClient(SUPABASE_URL, ANON_KEY);
