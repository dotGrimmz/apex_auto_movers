import { Hono } from "npm:hono@^4.6.0";
import { withErrorHandling } from "../lib/handler.ts";
import { jsonOk } from "../lib/responses.ts";
import { badRequest, unauthorized } from "../lib/errors.ts";
import { getAdminClient } from "../lib/supabase.ts";
import { requireUser } from "../lib/auth.ts";
import type { AppBindings } from "../types/index.ts";

export const profileRoutes = new Hono<AppBindings>();

const getProfile = withErrorHandling(async (c) => {
  const user = await requireUser(c);
  if (!user) throw unauthorized();

  const admin = getAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw badRequest(error.message);
  if (!profile) throw badRequest("Profile not found");
  return jsonOk(c, profile);
});

profileRoutes.get("/", getProfile);
profileRoutes.get("", getProfile);
