import type { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";

export function useCors(app: Hono) {
  console.log("cors");
  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["*"],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "apikey",
        "x-client-info",
        "x-supabase-api-version",
      ],
      credentials: true,
      maxAge: 86400,
    })
  );
  app.options("*", (c) => c.text("", 204));
}
