import type { Hono } from "npm:hono";
import { ok, fail } from "../lib/responses.ts";
import { createAdminClient } from "../lib/supabase.ts";

export function registerNewsletter(app: Hono) {
  app.post("/make-server-f0a9c31f/newsletter", async (c) => {
    try {
      const { email } = await c.req.json();
      if (!email) return fail(c, "Email is required", 400);
      const db = createAdminClient();
      const { error } = await db.from("newsletter_subscribers").insert({ email });
      if (error) {
        if (error.message.includes("duplicate")) return ok(c, { message: "Already subscribed" });
        return fail(c, error.message, 400);
      }
      return ok(c, { message: "Successfully subscribed to newsletter" });
    } catch (e: any) {
      return fail(c, e?.message || "Failed to subscribe", 500);
    }
  });
}

