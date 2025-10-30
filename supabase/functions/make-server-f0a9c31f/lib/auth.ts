import type { Context } from "npm:hono@^4.6.0";
import type { User } from "npm:@supabase/supabase-js@2";
import { getUserFromToken, isAdmin } from "./supabase.ts";

export async function getBearerToken(c: Context): Promise<string | null> {
  const authHeader = c.req.header("authorization") ?? c.req.header("Authorization");
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}

export async function requireUser(c: Context): Promise<User | null> {
  const token = await getBearerToken(c);
  if (!token) return null;
  const user = await getUserFromToken(token);
  return user ?? null;
}

export async function requireAdmin(c: Context): Promise<User | null> {
  const user = await requireUser(c);
  if (!user) return null;
  const admin = await isAdmin(user.id);
  return admin ? user : null;
}
