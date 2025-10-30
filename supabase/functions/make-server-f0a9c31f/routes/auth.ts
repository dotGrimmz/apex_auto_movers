import { Hono } from "npm:hono@^4.6.0";
import { withErrorHandling } from "../lib/handler.ts";
import { isSignupBody } from "../lib/validation.ts";
import { badRequest } from "../lib/errors.ts";
import { jsonOk } from "../lib/responses.ts";
import { getAdminClient } from "../lib/supabase.ts";
import type { AppBindings } from "../types/index.ts";

export const authRoutes = new Hono<AppBindings>();

authRoutes.post(
  "/signup",
  withErrorHandling(async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!isSignupBody(body)) throw badRequest("Email, password, and name are required");

    const admin = getAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      user_metadata: { name: body.name },
      email_confirm: true,
    });

    if (error) throw badRequest(error.message);

    await admin.from("profiles").update({ name: body.name }).eq("user_id", data.user.id);

    return jsonOk(
      c,
      {
        id: data.user.id,
        email: body.email,
        name: body.name,
      },
      201
    );
  })
);
