import { Hono } from "npm:hono@^4.6.0";
import { withErrorHandling } from "../lib/handler.ts";
import { jsonOk } from "../lib/responses.ts";
import { badRequest, forbidden, unauthorized } from "../lib/errors.ts";
import { getAdminClient } from "../lib/supabase.ts";
import { requireAdmin, requireUser } from "../lib/auth.ts";
import { isQuoteUpdateBody, isValidStatus } from "../lib/validation.ts";
import { sendQuoteEmail } from "../lib/email.ts";
import type { AppBindings } from "../types/index.ts";

export const quotesRoutes = new Hono<AppBindings>();

quotesRoutes.get(
  "/my",
  withErrorHandling(async (c) => {
    const user = await requireUser(c);
    if (!user) throw unauthorized();

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("quotes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw badRequest(error.message);
    return jsonOk(c, data ?? []);
  })
);

quotesRoutes.get(
  "/all",
  withErrorHandling(async (c) => {
    const adminUser = await requireAdmin(c);
    if (!adminUser) throw forbidden("Forbidden");

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw badRequest(error.message);
    return jsonOk(c, data ?? []);
  })
);

quotesRoutes.patch(
  "/:id/status",
  withErrorHandling(async (c) => {
    const adminUser = await requireAdmin(c);
    if (!adminUser) throw forbidden("Forbidden");

    const { id } = c.req.param();
    const status = (await c.req.json().catch(() => ({}))).status;
    if (!isValidStatus(status)) throw badRequest("Invalid status");

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("quotes")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw badRequest(error.message);
    if (!data) throw badRequest("Quote not found", { id });
    return jsonOk(c, data);
  })
);

quotesRoutes.patch(
  "/:id",
  withErrorHandling(async (c) => {
    const adminUser = await requireAdmin(c);
    if (!adminUser) throw forbidden("Forbidden");

    const { id } = c.req.param();
    const body = await c.req.json().catch(() => ({}));

    if (!isQuoteUpdateBody(body)) throw badRequest("Invalid payload");

    const updates: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(body, "status")) {
      if (!isValidStatus(body.status)) throw badRequest("Invalid status");
      updates.status = body.status;
    }

    if (Object.prototype.hasOwnProperty.call(body, "quote_amount")) {
      const raw = body.quote_amount;
      if (raw === null) {
        updates.quote_amount = null;
      } else {
        const amount = typeof raw === "number" ? raw : Number(raw);
        if (!Number.isFinite(amount) || amount < 0) throw badRequest("Invalid quote amount");
        updates.quote_amount = amount;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "admin_notes")) {
      const notes = body.admin_notes;
      if (notes !== null && typeof notes !== "string") throw badRequest("Invalid admin notes");
      updates.admin_notes = notes;
    }

    if (Object.prototype.hasOwnProperty.call(body, "pickup_date")) {
      const pickupDate = body.pickup_date;
      if (pickupDate !== null && typeof pickupDate !== "string") throw badRequest("Invalid pickup date");
      updates.pickup_date = pickupDate;
    }

    if (Object.prototype.hasOwnProperty.call(body, "estimated_delivery_date")) {
      const eta = body.estimated_delivery_date;
      if (eta !== null && typeof eta !== "string") {
        throw badRequest("Invalid estimated delivery date");
      }
      updates.estimated_delivery_date = eta;
    }

    if (Object.keys(updates).length === 0) throw badRequest("No changes provided");

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("quotes")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw badRequest(error.message);
    if (!data) throw badRequest("Quote not found", { id });
    return jsonOk(c, data);
  })
);

quotesRoutes.post(
  "/:id/send",
  withErrorHandling(async (c) => {
    const adminUser = await requireAdmin(c);
    if (!adminUser) throw forbidden("Forbidden");

    const { id } = c.req.param();
    const body = await c.req.json().catch(() => ({}));
    const quoteAmount = typeof body.quote_amount === "number" ? body.quote_amount : Number(body.quote_amount);
    if (!Number.isFinite(quoteAmount) || quoteAmount <= 0) throw badRequest("Quote amount must be greater than zero");
    if (body.message !== undefined && typeof body.message !== "string") throw badRequest("Invalid message");

    const admin = getAdminClient();
    const { data: quote, error: fetchError } = await admin.from("quotes").select("*").eq("id", id).single();
    if (fetchError) throw badRequest(fetchError.message);
    if (!quote) throw badRequest("Quote not found", { id });

    await sendQuoteEmail({
      to: quote.email,
      customerName: quote.name,
      quoteAmount,
      pickup: quote.pickup,
      delivery: quote.delivery,
      transportType: quote.transport_type,
      message: body.message,
    });

    const { data, error } = await admin
      .from("quotes")
      .update({
        quote_amount: quoteAmount,
        status: "contacted",
        email_sent_at: new Date().toISOString(),
        admin_notes: body.message ?? quote.admin_notes,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw badRequest(error.message);
    if (!data) throw badRequest("Quote not found", { id });
    return jsonOk(c, data);
  })
);
