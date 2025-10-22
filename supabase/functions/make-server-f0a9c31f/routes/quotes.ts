import type { Hono } from "npm:hono";
import { ok, fail } from "../lib/responses.ts";
import { createAdminClient } from "../lib/supabase.ts";
import { validateQuote } from "../lib/validation.ts";

export function registerQuotes(app: Hono) {
  // Submit quote (guest or authenticated)
  app.post("/make-server-f0a9c31f/quote", async (c) => {
    try {
      const body = await c.req.json();
      if (!validateQuote(body)) return fail(c, "Invalid quote payload", 400);

      const accessToken = c.req.header("Authorization")?.split(" ")[1];
      const admin = createAdminClient();
      let userId: string | null = null;
      if (accessToken) {
        const { data: authUser } = await admin.auth.getUser(accessToken);
        userId = authUser?.user?.id ?? null;
      }

      const insert = {
        user_id: userId,
        name: body.name,
        email: body.email,
        phone: body.phone ?? null,
        pickup: body.pickup,
        delivery: body.delivery,
        make: body.make,
        model: body.model,
        transport_type: body.transport_type,
        pickup_date: body.pickup_date ?? null,
        status: "new" as const,
      };
      const { data, error } = await admin.from("quotes").insert(insert).select("*").single();
      if (error) return fail(c, error.message, 400);
      return ok(c, data);
    } catch (e: any) {
      return fail(c, e?.message || "Failed to submit quote", 500);
    }
  });

  // Get user's quotes (authenticated)
  app.get("/make-server-f0a9c31f/quotes/my", async (c) => {
    try {
      const token = c.req.header("Authorization")?.split(" ")[1];
      if (!token) return fail(c, "Unauthorized", 401);

      const admin = createAdminClient();
      const { data: { user }, error } = await admin.auth.getUser(token);
      if (!user || error) return fail(c, "Unauthorized", 401);

      const { data: quotes, error: qerr } = await admin
        .from("quotes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (qerr) return fail(c, qerr.message, 400);
      return ok(c, quotes ?? []);
    } catch (e: any) {
      return fail(c, e?.message || "Failed to fetch quotes", 500);
    }
  });
}

