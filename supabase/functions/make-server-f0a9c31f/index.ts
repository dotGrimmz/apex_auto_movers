import { Hono } from "npm:hono@^4.6.0";
import { cors } from "npm:hono@^4.6.0/cors";
import { handleError } from "./lib/handler.ts";
import { jsonError, jsonOk } from "./lib/responses.ts";
import { requestLogger } from "./middleware/request-logger.ts";
import { authRoutes } from "./routes/auth.ts";
import { quoteRoutes } from "./routes/quote.ts";
import { quotesRoutes } from "./routes/quotes.ts";
import { newsletterRoutes } from "./routes/newsletter.ts";
import { profileRoutes } from "./routes/profile.ts";
import { healthRoutes } from "./routes/health.ts";
import type { AppBindings } from "./types/index.ts";

const BASE_PATH = "/make-server-f0a9c31f";

const app = new Hono<AppBindings>();

app.use("*", cors());
app.use("*", requestLogger());

const rootHandler = (c: any) => jsonOk(c, { status: "ok", version: "1.0" });

app.get("/", rootHandler);
app.get(BASE_PATH, rootHandler);

app.route("/health", healthRoutes);
app.route(`${BASE_PATH}/health`, healthRoutes);

app.route("/auth", authRoutes);
app.route(`${BASE_PATH}/auth`, authRoutes);

app.route("/quote", quoteRoutes);
app.route(`${BASE_PATH}/quote`, quoteRoutes);

app.route("/quotes", quotesRoutes);
app.route(`${BASE_PATH}/quotes`, quotesRoutes);

app.route("/newsletter", newsletterRoutes);
app.route(`${BASE_PATH}/newsletter`, newsletterRoutes);

app.route("/profile", profileRoutes);
app.route(`${BASE_PATH}/profile`, profileRoutes);

app.notFound((c: any) => {
  const requestId = c.get("requestId");
  console.warn(`[#${requestId ?? "n/a"}] unmatched route`, {
    method: c.req.method,
    path: c.req.path,
  });
  return jsonError(c, "Not found", 404);
});
app.onError((err: unknown, c: any) => handleError(c, err));

Deno.serve((req: any) => app.fetch(req));
