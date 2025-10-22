import type { Hono } from "npm:hono";
import { ok, fail } from "../lib/responses.ts";
import { createAdminClient } from "../lib/supabase.ts";

export function registerProfile(app: Hono) {
  app.get("/make-server-f0a9c31f/profile", async (c) => {
    try {
      const token = c.req.header("Authorization")?.split(" ")[1];
      if (!token) return fail(c, "Unauthorized", 401);
      const admin = createAdminClient();
      const { data: { user }, error } = await admin.auth.getUser(token);
      if (!user || error) return fail(c, "Unauthorized", 401);

      const { data: profile, error: perr } = await admin
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (perr) return fail(c, perr.message, 400);
      if (!profile) return fail(c, "Profile not found", 404);
      return ok(c, profile);
    } catch (e: any) {
      return fail(c, e?.message || "Failed to fetch profile", 500);
    }
  });
}

