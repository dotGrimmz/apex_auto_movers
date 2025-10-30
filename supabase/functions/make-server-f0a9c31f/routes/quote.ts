import { Hono } from "npm:hono@^4.6.0";
import { withErrorHandling } from "../lib/handler.ts";
import { isQuoteBody } from "../lib/validation.ts";
import { badRequest } from "../lib/errors.ts";
import { getAdminClient } from "../lib/supabase.ts";
import { jsonOk } from "../lib/responses.ts";
import { getBearerToken } from "../lib/auth.ts";
import type { AppBindings } from "../types/index.ts";

export const quoteRoutes = new Hono<AppBindings>();

const submitQuoteHandler = withErrorHandling(async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!isQuoteBody(body)) throw badRequest("Invalid quote payload");

  const admin = getAdminClient();
  let userId: string | null = null;
  const token = await getBearerToken(c);
  if (token) {
    const { data } = await admin.auth.getUser(token);
    userId = data?.user?.id ?? null;
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
  if (error) throw badRequest(error.message);

  return jsonOk(c, data, 201);
});

quoteRoutes.post("/", submitQuoteHandler);
quoteRoutes.post("", submitQuoteHandler);
