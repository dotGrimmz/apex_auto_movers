import { createClient } from "npm:@supabase/supabase-js@2";
import { ENV } from "./env.ts";

export const createAdminClient = () =>
  createClient(ENV.SUPABASE_URL(), ENV.SERVICE_KEY());

export const createUserClient = (accessToken: string) =>
  createClient(ENV.SUPABASE_URL(), ENV.ANON_KEY(), {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

