import type { Hono } from "npm:hono";
import { ok, fail } from "../lib/responses.ts";
import { createAdminClient } from "../lib/supabase.ts";
import { validateSignup } from "../lib/validation.ts";

export function registerAuth(app: Hono) {
  app.post("/make-server-f0a9c31f/signup", async (c) => {
    try {
      const body = await c.req.json();
      if (!validateSignup(body)) return fail(c, "Email, password, and name are required", 400);

      const admin = createAdminClient();
      const { data, error } = await admin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        user_metadata: { name: body.name },
        email_confirm: true,
      });
      if (error) return fail(c, error.message, 400);

      await admin.from("profiles").update({ name: body.name }).eq("user_id", data.user.id);
      return ok(c, { id: data.user.id, email: body.email, name: body.name });
    } catch (e: any) {
      return fail(c, e?.message || "Failed to create account", 500);
    }
  });
}

