import type { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";

export function useCors(app: Hono) {
  app.use(
    "*",
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://apex-auto-movers.vercel.app/",
      ],
      allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "apikey",
        "x-client-info",
        "x-supabase-api-version",
      ],
      credentials: false,
      maxAge: 86400,
    })
  );
  app.options("*", (c) => c.text("", 204));
}
