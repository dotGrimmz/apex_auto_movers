import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/config.ts";
import { jsonError, jsonOk } from "../_shared/responses.ts";
import { requireUser } from "../_shared/auth.ts";
import { createAdminClient } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === "GET") {
    const user = await requireUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    const admin = createAdminClient(req);
    const { data: profile, error } = await admin
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return jsonError(error.message, 400);
    if (!profile) return jsonError("Profile not found", 404);
    return jsonOk(profile);
  }

  return new Response("Not found", { status: 404, headers: corsHeaders });
});
