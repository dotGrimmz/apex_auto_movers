import type { Context } from "npm:hono@^4.6.0";

export interface ErrorPayload {
  message: string;
  details?: unknown;
}

export function jsonOk<T>(c: Context, data: T, status = 200) {
  return c.json({ success: true, data }, status);
}

export function jsonError(c: Context, message: string, status = 400, details?: unknown) {
  console.error(`[error] ${message}`, details ?? "");
  return c.json({ success: false, error: message, details }, status);
}
