import type { Hono } from "npm:hono";
import { ok, fail } from "../lib/responses.ts";
import { createAdminClient } from "../lib/supabase.ts";

async function requireAdmin(token?: string) {
  if (!token) return { ok: false as const, status: 401 };
  const admin = createAdminClient();
  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token);
  if (!user || error) return { ok: false as const, status: 401 };
  const { data: isAdmin, error: aerr } = await admin.rpc("is_admin", {
    uid: user.id,
  });
  if (aerr || !isAdmin) return { ok: false as const, status: 403 };
  return { ok: true as const, admin, user };
}

export function registerAdmin(app: Hono) {
  // Fetch all quotes (admin only)
  app.get(
    "/make-server-f0a9c31f/quotes/all",
    async (c: { req: { header: (arg0: string) => string } }) => {
      const token = c.req.header("Authorization")?.split(" ")[1];
      const res = await requireAdmin(token);
      if (!res.ok)
        return fail(
          c,
          res.status === 403 ? "Forbidden" : "Unauthorized",
          res.status
        );
      const { data, error } = await res.admin
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return fail(c, error.message, 400);
      return ok(c, data ?? []);
    }
  );

  // Update quote status (admin only)
  app.patch(
    "/make-server-f0a9c31f/quotes/:id/status",
    async (c: {
      req: {
        header: (arg0: string) => string;
        param: (arg0: string) => any;
        json: () => PromiseLike<{ status: any }> | { status: any };
      };
    }) => {
      const token = c.req.header("Authorization")?.split(" ")[1];
      const res = await requireAdmin(token);
      if (!res.ok)
        return fail(
          c,
          res.status === 403 ? "Forbidden" : "Unauthorized",
          res.status
        );

      const id = c.req.param("id");
      const { status } = await c.req.json();
      if (!["new", "contacted", "booked", "completed"].includes(status))
        return fail(c, "Invalid status", 400);
      const { data, error } = await res.admin
        .from("quotes")
        .update({ status })
        .eq("id", id)
        .select("*")
        .single();
      if (error) return fail(c, error.message, 400);
      if (!data) return fail(c, "Quote not found", 404);
      return ok(c, data);
    }
  );
}
