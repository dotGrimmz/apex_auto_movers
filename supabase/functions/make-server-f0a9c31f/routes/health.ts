import { Hono } from "npm:hono@^4.6.0";
import { jsonOk } from "../lib/responses.ts";
import type { AppBindings } from "../types/index.ts";

export const healthRoutes = new Hono<AppBindings>();

healthRoutes.get("/", (c) => {
  return jsonOk(c, {
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
