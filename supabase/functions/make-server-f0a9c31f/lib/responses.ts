import type { Context } from "npm:hono";

export function ok<T>(c: Context, data: T, status = 200) {
  return c.json({ success: true, data }, status);
}

export function fail(c: Context, message: string, status = 400) {
  return c.json({ success: false, error: message }, status);
}

