import type { Hono } from "hono";
import { cors } from "npm:hono/cors";

export function useCors(app: Hono) {
  console.log("cors");
  app.use(
    "*",
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://apex-auto-movers.vercel.app",
      ],
      allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
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
  app.options("*", (c: any) => {
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
    c.header(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization,apikey,x-client-info,x-supabase-api-version"
    );
    c.header("Access-Control-Allow-Credentials", "true");
    return c.text("", 204);
  });
}
