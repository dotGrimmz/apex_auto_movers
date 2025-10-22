import type { Context } from "npm:hono";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function handleErrors(err: Error, c: Context) {
  const status = (err as any).status ?? 500;
  const msg = err.message || "Internal Server Error";
  return c.json({ success: false, error: msg }, status);
}

