import type { User } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { createAdminClient } from "./supabase.ts";

export function getBearerToken(req: Request): string | null {
  const authHeader =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!authHeader) return null;
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  return authHeader.slice(7);
}

export async function requireUser(req: Request): Promise<User | null> {
  const token = getBearerToken(req);
  if (!token) return null;
  const admin = createAdminClient(req);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function requireAdmin(req: Request): Promise<User | null> {
  const user = await requireUser(req);
  if (!user) return null;
  const admin = createAdminClient(req);
  const { data, error } = await admin.rpc("is_admin", { uid: user.id });
  if (error || !data) return null;
  return user;
}
