import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/config.ts";
import { jsonError, jsonOk } from "../_shared/responses.ts";
import { createAdminClient } from "../_shared/supabase.ts";
import { parseJson } from "../_shared/request.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === "POST") {
    try {
      const body = await parseJson<{ email?: string }>(req);
      const email = body?.email;
      if (!email) return jsonError("Email is required", 400);

      const admin = createAdminClient(req);
      const { error } = await admin
        .from("newsletter_subscribers")
        .insert({ email });

      if (error) {
        if (String(error.message).toLowerCase().includes("duplicate")) {
          return jsonOk({ message: "Already subscribed" });
        }
        return jsonError(error.message, 400);
      }

      return jsonOk({ message: "Successfully subscribed to newsletter" });
    } catch (error: any) {
      return jsonError(error?.message || "Failed to subscribe", 500);
    }
  }

  return new Response("Not found", { status: 404, headers: corsHeaders });
});
