import type { Context, Handler } from "npm:hono@^4.6.0";
import { HttpError, serverError } from "./errors.ts";
import { jsonError } from "./responses.ts";

export function withErrorHandling<T extends Context>(handler: Handler<T>) {
  return async (c: T) => {
    try {
      return await handler(c);
    } catch (error) {
      return handleError(c, error);
    }
  };
}

export function handleError(c: Context, error: unknown) {
  if (error instanceof HttpError) {
    return jsonError(c, error.message, error.status, error.details);
  }

  console.error("[handler] Unexpected error", error);
  const fallback = error instanceof Error ? error.message : String(error);
  return jsonError(c, serverError().message, 500, fallback);
}
