import { Hono } from "npm:hono";
import { useCors } from "./middleware/cors.ts";
import { useLogger } from "./middleware/logger.ts";
import { registerHealth } from "./routes/health.ts";
import { registerAuth } from "./routes/auth.ts";
import { registerQuotes } from "./routes/quotes.ts";
import { registerAdmin } from "./routes/admin.ts";
import { registerNewsletter } from "./routes/newsletter.ts";
import { registerProfile } from "./routes/profile.ts";
import { handleErrors } from "./lib/errors.ts";
import { cors } from "hono/cors";

const app = new Hono();

app.use(cors());
// Global middleware
useCors(app);
useLogger(app);

// Routes
registerHealth(app);
registerAuth(app);
registerQuotes(app);
registerAdmin(app);
registerNewsletter(app);
registerProfile(app);

// Global error handler
app.onError(handleErrors);

export default app.fetch;
