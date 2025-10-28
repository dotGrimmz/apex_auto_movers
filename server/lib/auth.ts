import type { Request } from "express";
import { createAdminClient } from "./supabase";

export function getBearerToken(req: Request) {
  const auth = req.header("authorization") || req.header("Authorization");
  if (!auth) return undefined;
  return auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
}

export async function requireUser(req: Request) {
  const token = getBearerToken(req);
  if (!token) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function requireAdmin(req: Request) {
  const user = await requireUser(req);
  if (!user) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("is_admin", { uid: user.id });
  if (error || !data) return null;
  return user;
}
