import type { Hono } from "npm:hono";
import { logger } from "npm:hono/logger";

export function useLogger(app: Hono) {
  app.use("*", logger());
}

