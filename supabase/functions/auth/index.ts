import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/config.ts";
import { jsonError, jsonOk } from "../_shared/responses.ts";
import { parseJson } from "../_shared/request.ts";
import { isSignupBody } from "../_shared/validation.ts";
import { createAdminClient } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\/auth/, "");

  if (req.method === "POST" && pathname === "/signup") {
    const body = await parseJson<any>(req);
    if (!isSignupBody(body)) {
      return jsonError("Email, password, and name are required", 400);
    }

    try {
      const admin = createAdminClient(req);
      const { data, error } = await admin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        user_metadata: { name: body.name },
        email_confirm: true,
      });
      if (error || !data?.user) {
        return jsonError(error?.message || "Failed to create account", 400);
      }

      await admin
        .from("profiles")
        .update({ name: body.name })
        .eq("user_id", data.user.id);

      return jsonOk({ id: data.user.id, email: body.email, name: body.name });
    } catch (error: any) {
      return jsonError(error?.message || "Failed to create account", 500);
    }
  }

  return new Response("Not found", { status: 404, headers: corsHeaders });
});
