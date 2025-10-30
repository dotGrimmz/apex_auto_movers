import { Hono } from "npm:hono@^4.6.0";
import { withErrorHandling } from "../lib/handler.ts";
import { badRequest } from "../lib/errors.ts";
import { jsonOk } from "../lib/responses.ts";
import { getAdminClient } from "../lib/supabase.ts";
import type { AppBindings } from "../types/index.ts";

export const newsletterRoutes = new Hono<AppBindings>();

const subscribeHandler = withErrorHandling(async (c) => {
  const { email } = (await c.req.json().catch(() => ({}))) as { email?: string };
  if (!email) throw badRequest("Email is required");

  const admin = getAdminClient();
  const { error } = await admin.from("newsletter_subscribers").insert({ email });
  if (error) {
    const message = String(error.message).toLowerCase();
    if (message.includes("duplicate")) {
      return jsonOk(c, { message: "Already subscribed" });
    }
    throw badRequest(error.message);
  }

  return jsonOk(c, { message: "Successfully subscribed to newsletter" }, 201);
});

newsletterRoutes.post("/", subscribeHandler);
newsletterRoutes.post("", subscribeHandler);
