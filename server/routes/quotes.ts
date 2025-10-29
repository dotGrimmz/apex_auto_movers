import { Router } from "express";
import { jsonOk, jsonError } from "../lib/responses";
import { createAdminClient } from "../lib/supabase";
import { requireUser, requireAdmin } from "../lib/auth";
import { isValidStatus, isQuoteUpdateBody } from "../lib/validation";
import { sendQuoteEmail } from "../lib/email";

const router = Router();

router.get("/my", async (req, res) => {
  try {
    // user is null or not showing
    const user = await requireUser(req);
    console.log({ user });
    if (!user) return jsonError(res, "Unauthorized", 401);
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("quotes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return jsonError(res, error.message, 400);
    return jsonOk(res, data ?? []);
  } catch (e: any) {
    return jsonError(res, e?.message || "Failed to fetch quotes", 500);
  }
});

router.get("/all", async (req, res) => {
  const adminUser = await requireAdmin(req);
  if (!adminUser) return jsonError(res, "Forbidden", 403);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return jsonError(res, error.message, 400);
  return jsonOk(res, data ?? []);
});

router.patch("/:id/status", async (req, res) => {
  const adminUser = await requireAdmin(req);
  if (!adminUser) return jsonError(res, "Forbidden", 403);
  const { id } = req.params;
  const status = (req.body || {}).status;
  if (!isValidStatus(status)) return jsonError(res, "Invalid status", 400);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("quotes")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return jsonError(res, error.message, 400);
  if (!data) return jsonError(res, "Quote not found", 404);
  return jsonOk(res, data);
});

router.patch("/:id", async (req, res) => {
  const adminUser = await requireAdmin(req);
  if (!adminUser) return jsonError(res, "Forbidden", 403);
  const { id } = req.params;
  const body = req.body ?? {};
  if (!isQuoteUpdateBody(body)) {
    return jsonError(res, "Invalid payload", 400);
  }

  const updates: Record<string, any> = {};
  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    if (!isValidStatus(body.status)) {
      return jsonError(res, "Invalid status", 400);
    }
    updates.status = body.status;
  }
  if (Object.prototype.hasOwnProperty.call(body, "quote_amount")) {
    const rawAmount = body.quote_amount;
    if (rawAmount === null) {
      updates.quote_amount = null;
    } else {
      const amount =
        typeof rawAmount === "number" ? rawAmount : Number(rawAmount);
      if (!Number.isFinite(amount) || amount < 0) {
        return jsonError(res, "Invalid quote amount", 400);
      }
      updates.quote_amount = amount;
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, "admin_notes")) {
    const notes = body.admin_notes;
    if (notes !== null && typeof notes !== "string") {
      return jsonError(res, "Invalid admin notes", 400);
    }
    updates.admin_notes = notes;
  }
  if (Object.prototype.hasOwnProperty.call(body, "pickup_date")) {
    const pickupDate = body.pickup_date;
    if (pickupDate !== null && typeof pickupDate !== "string") {
      return jsonError(res, "Invalid pickup date", 400);
    }
    updates.pickup_date = pickupDate;
  }
  if (Object.prototype.hasOwnProperty.call(body, "estimated_delivery_date")) {
    const estimatedDeliveryDate = body.estimated_delivery_date;
    if (
      estimatedDeliveryDate !== null &&
      typeof estimatedDeliveryDate !== "string"
    ) {
      return jsonError(res, "Invalid estimated delivery date", 400);
    }
    updates.estimated_delivery_date = estimatedDeliveryDate;
  }

  if (Object.keys(updates).length === 0) {
    return jsonError(res, "No changes provided", 400);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("quotes")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return jsonError(res, error.message, 400);
  if (!data) return jsonError(res, "Quote not found", 404);
  return jsonOk(res, data);
});

router.post("/:id/send", async (req, res) => {
  const adminUser = await requireAdmin(req);
  if (!adminUser) return jsonError(res, "Forbidden", 403);
  const { id } = req.params;
  const { quote_amount: rawQuoteAmount, message } = req.body ?? {};
  const quoteAmount =
    typeof rawQuoteAmount === "number" ? rawQuoteAmount : Number(rawQuoteAmount);
  if (!Number.isFinite(quoteAmount) || quoteAmount <= 0) {
    return jsonError(res, "Quote amount must be greater than zero", 400);
  }
  if (message !== undefined && typeof message !== "string") {
    return jsonError(res, "Invalid message", 400);
  }

  const admin = createAdminClient();
  const {
    data: quote,
    error: fetchError,
  } = await admin.from("quotes").select("*").eq("id", id).single();
  if (fetchError) return jsonError(res, fetchError.message, 400);
  if (!quote) return jsonError(res, "Quote not found", 404);

  try {
    await sendQuoteEmail({
      to: quote.email,
      customerName: quote.name,
      quoteAmount,
      pickup: quote.pickup,
      delivery: quote.delivery,
      transportType: quote.transport_type,
      message,
    });
  } catch (error: any) {
    return jsonError(res, error?.message || "Failed to send quote email", 500);
  }

  const {
    data,
    error,
  } = await admin
    .from("quotes")
    .update({
      quote_amount: quoteAmount,
      status: "quoted",
      email_sent_at: new Date().toISOString(),
      admin_notes: message ?? quote.admin_notes,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return jsonError(res, error.message, 400);
  if (!data) return jsonError(res, "Quote not found", 404);
  return jsonOk(res, data);
});

export default router;
