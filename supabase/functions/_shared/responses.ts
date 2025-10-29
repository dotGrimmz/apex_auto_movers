import { corsHeaders } from "./config.ts";

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export function jsonOk(data: unknown, status = 200) {
  return response({ success: true, data }, status);
}

export function jsonError(error: string, status = 400) {
  return response({ success: false, error }, status);
}
