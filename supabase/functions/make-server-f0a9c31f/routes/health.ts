import type { Hono } from "npm:hono";
import { ok } from "../lib/responses.ts";

export function registerHealth(app: Hono) {
  app.get("/make-server-f0a9c31f/health", (c) => ok(c, { status: "ok", timestamp: new Date().toISOString() }));
}

