import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/config.ts";
import { jsonOk } from "../_shared/responses.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return jsonOk({ status: "ok", timestamp: new Date().toISOString() });
  }

  return new Response("Not found", {
    status: 404,
    headers: corsHeaders,
  });
});
