import type { Context, MiddlewareHandler } from "npm:hono@^4.6.0";

function formatUrl(c: Context) {
  try {
    const url = new URL(c.req.url);
    return `${url.pathname}${url.search}`;
  } catch {
    return c.req.path;
  }
}

export const requestLogger = (): MiddlewareHandler => {
  return async (c: Context, next) => {
    const requestId = crypto.randomUUID();
    c.set("requestId", requestId);

    const info = {
      method: c.req.method,
      url: formatUrl(c),
      origin: c.req.header("origin") ?? null,
      userAgent: c.req.header("user-agent") ?? null,
      ip: c.req.header("x-forwarded-for") ?? null,
    };

    const start = Date.now();
    console.log(`[#${requestId}] incoming`, info);

    try {
      await next();
    } catch (error) {
      console.error(`[#${requestId}] handler error`, error);
      throw error;
    } finally {
      const duration = Date.now() - start;
      console.log(`[#${requestId}] completed`, {
        status: c.res.status,
        durationMs: duration,
      });
    }
  };
};
