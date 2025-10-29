import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/config.ts";
import { jsonError, jsonOk } from "../_shared/responses.ts";
import { requireAdmin, requireUser } from "../_shared/auth.ts";
import { createAdminClient } from "../_shared/supabase.ts";
import { isQuoteUpdateBody, isValidStatus } from "../_shared/validation.ts";
import { parseJson } from "../_shared/request.ts";
import { sendQuoteEmail } from "../_shared/email.ts";

function routePath(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\/quotes/, "");
  const segments = pathname.split("/").filter(Boolean);
  return segments;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const segments = routePath(req);

  try {
    if (req.method === "GET" && segments.length === 1 && segments[0] === "my") {
      const user = await requireUser(req);
      if (!user) return jsonError("Unauthorized", 401);
      const admin = createAdminClient(req);
      const { data, error } = await admin
        .from("quotes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) return jsonError(error.message, 400);
      return jsonOk(data ?? []);
    }

    if (req.method === "GET" && segments.length === 1 && segments[0] === "all") {
      const adminUser = await requireAdmin(req);
      if (!adminUser) return jsonError("Forbidden", 403);
      const admin = createAdminClient(req);
      const { data, error } = await admin
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return jsonError(error.message, 400);
      return jsonOk(data ?? []);
    }

    if (req.method === "PATCH" && segments.length === 2 && segments[1] === "status") {
      const [id] = segments;
      const adminUser = await requireAdmin(req);
      if (!adminUser) return jsonError("Forbidden", 403);
      const body = await parseJson<{ status?: string }>(req);
      const status = body?.status;
      if (!isValidStatus(status)) return jsonError("Invalid status", 400);
      const admin = createAdminClient(req);
      const { data, error } = await admin
        .from("quotes")
        .update({ status })
        .eq("id", id)
        .select("*")
        .single();
      if (error) return jsonError(error.message, 400);
      if (!data) return jsonError("Quote not found", 404);
      return jsonOk(data);
    }

    if (req.method === "PATCH" && segments.length === 1) {
      const [id] = segments;
      const adminUser = await requireAdmin(req);
      if (!adminUser) return jsonError("Forbidden", 403);
      const body = await parseJson<Record<string, unknown>>(req);
      if (!isQuoteUpdateBody(body)) return jsonError("Invalid payload", 400);

      const updates: Record<string, unknown> = {};

      if (Object.prototype.hasOwnProperty.call(body, "status")) {
        if (!isValidStatus(body?.status)) {
          return jsonError("Invalid status", 400);
        }
        updates.status = body?.status;
      }
      if (Object.prototype.hasOwnProperty.call(body, "quote_amount")) {
        const rawAmount = (body as any).quote_amount;
        if (rawAmount === null) {
          updates.quote_amount = null;
        } else {
          const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);
          if (!Number.isFinite(amount) || amount < 0) {
            return jsonError("Invalid quote amount", 400);
          }
          updates.quote_amount = amount;
        }
      }
      if (Object.prototype.hasOwnProperty.call(body, "admin_notes")) {
        const notes = (body as any).admin_notes;
        if (notes !== null && typeof notes !== "string") {
          return jsonError("Invalid admin notes", 400);
        }
        updates.admin_notes = notes;
      }
      if (Object.prototype.hasOwnProperty.call(body, "pickup_date")) {
        const pickupDate = (body as any).pickup_date;
        if (pickupDate !== null && typeof pickupDate !== "string") {
          return jsonError("Invalid pickup date", 400);
        }
        updates.pickup_date = pickupDate;
      }
      if (Object.prototype.hasOwnProperty.call(body, "estimated_delivery_date")) {
        const estimatedDeliveryDate = (body as any).estimated_delivery_date;
        if (estimatedDeliveryDate !== null && typeof estimatedDeliveryDate !== "string") {
          return jsonError("Invalid estimated delivery date", 400);
        }
        updates.estimated_delivery_date = estimatedDeliveryDate;
      }

      if (Object.keys(updates).length === 0) {
        return jsonError("No changes provided", 400);
      }

      const admin = createAdminClient(req);
      const { data, error } = await admin
        .from("quotes")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();
      if (error) return jsonError(error.message, 400);
      if (!data) return jsonError("Quote not found", 404);
      return jsonOk(data);
    }

    if (req.method === "POST" && segments.length === 2 && segments[1] === "send") {
      const [id] = segments;
      const adminUser = await requireAdmin(req);
      if (!adminUser) return jsonError("Forbidden", 403);
      const body = await parseJson<Record<string, unknown>>(req);
      const rawAmount = body?.quote_amount;
      const message = body?.message;
      const quoteAmount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);
      if (!Number.isFinite(quoteAmount) || quoteAmount <= 0) {
        return jsonError("Quote amount must be greater than zero", 400);
      }
      if (message !== undefined && typeof message !== "string") {
        return jsonError("Invalid message", 400);
      }
      const trimmedMessage = typeof message === "string" ? message.trim() : undefined;

      const admin = createAdminClient(req);
      const { data: quote, error: fetchError } = await admin
        .from("quotes")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) return jsonError(fetchError.message, 400);
      if (!quote) return jsonError("Quote not found", 404);

      await sendQuoteEmail({
        to: quote.email,
        customerName: quote.name,
        quoteAmount,
        pickup: quote.pickup,
        delivery: quote.delivery,
        transportType: quote.transport_type,
        message: trimmedMessage,
      });

      const { data, error } = await admin
        .from("quotes")
        .update({
          quote_amount: quoteAmount,
          status: "contacted",
          email_sent_at: new Date().toISOString(),
          admin_notes:
            trimmedMessage && trimmedMessage.length > 0
              ? trimmedMessage
              : quote.admin_notes,
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error) return jsonError(error.message, 400);
      if (!data) return jsonError("Quote not found", 404);
      return jsonOk(data);
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  } catch (error: any) {
    return jsonError(error?.message || "Unexpected error", 500);
  }
});
