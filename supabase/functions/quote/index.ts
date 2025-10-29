import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/config.ts";
import { jsonError, jsonOk } from "../_shared/responses.ts";
import { parseJson } from "../_shared/request.ts";
import { isQuoteBody } from "../_shared/validation.ts";
import { createAdminClient } from "../_shared/supabase.ts";
import { getBearerToken } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === "POST") {
    try {
      const body = await parseJson<any>(req);
      if (!isQuoteBody(body)) {
        return jsonError("Invalid quote payload", 400);
      }

      const admin = createAdminClient(req);
      let userId: string | null = null;
      const token = getBearerToken(req);
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

      const { data, error } = await admin
        .from("quotes")
        .insert(insert)
        .select("*")
        .single();

      if (error) return jsonError(error.message, 400);
      return jsonOk(data);
    } catch (error: any) {
      return jsonError(error?.message || "Failed to submit quote", 500);
    }
  }

  return new Response("Not found", { status: 404, headers: corsHeaders });
});
