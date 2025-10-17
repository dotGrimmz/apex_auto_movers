import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
// Postgres-backed implementation using Supabase client and your RLS schema

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// No schema bootstrap here; run the provided SQL in Supabase

// Health check
app.get("/make-server-f0a9c31f/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Sign up endpoint
app.post("/make-server-f0a9c31f/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    // Optionally, update profile name (trigger creates profile row with role 'user')
    const rpcClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    await rpcClient.from("profiles").update({ name }).eq("user_id", data.user.id);

    return c.json({
      success: true,
      user: { id: data.user.id, email, name },
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Submit quote (guest or authenticated)
app.post("/make-server-f0a9c31f/quote", async (c) => {
  try {
    const body = await c.req.json();
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    let userId: string | null = null;
    if (accessToken && accessToken !== Deno.env.get("SUPABASE_ANON_KEY")) {
      const { data: authUser, error: authErr } = await supabase.auth.getUser(accessToken);
      if (!authErr && authUser?.user) {
        userId = authUser.user.id;
      }
    }

    const required = [
      "name",
      "email",
      "pickup",
      "delivery",
      "make",
      "model",
      "transport_type",
    ];
    for (const k of required) {
      if (!body[k]) return c.json({ error: `Missing field: ${k}` }, 400);
    }
    if (!["open", "enclosed"].includes(body.transport_type)) {
      return c.json({ error: "Invalid transport_type" }, 400);
    }

    // Use service role to insert, explicitly setting user_id (nullable for guests)
    const svc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const insert = {
      user_id: userId,
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      pickup: body.pickup,
      delivery: body.delivery,
      make: body.make,
      model: body.model,
      transport_type: body.transport_type,
      pickup_date: body.pickup_date ?? null,
      status: "new",
    };
    const { data, error } = await svc.from("quotes").insert(insert).select("*").single();
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true, quote: data });
  } catch (error) {
    console.error("Quote submission error:", error);
    return c.json({ error: "Failed to submit quote" }, 500);
  }
});

// Get user's quotes (authenticated)
app.get("/make-server-f0a9c31f/quotes/my", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken || accessToken === Deno.env.get("SUPABASE_ANON_KEY")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: quotes, error: qerr } = await db
      .from("quotes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (qerr) return c.json({ error: qerr.message }, 400);
    return c.json({ success: true, quotes: quotes ?? [] });
  } catch (error) {
    console.error("Get quotes error:", error);
    return c.json({ error: "Failed to fetch quotes" }, 500);
  }
});

// Get all quotes (admin only)
app.get("/make-server-f0a9c31f/quotes/all", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken || accessToken === Deno.env.get("SUPABASE_ANON_KEY")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin via DB function
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: isAdminRes, error: aerr } = await db.rpc("is_admin", { uid: user.id });
    if (aerr) return c.json({ error: aerr.message }, 400);
    if (!isAdminRes) return c.json({ error: "Forbidden - Admin access required" }, 403);

    const { data: allQuotes, error: qerr } = await db
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });
    if (qerr) return c.json({ error: qerr.message }, 400);
    return c.json({ success: true, quotes: allQuotes ?? [] });
  } catch (error) {
    console.error("Get all quotes error:", error);
    return c.json({ error: "Failed to fetch quotes" }, 500);
  }
});

// Update quote status (admin only)
app.patch("/make-server-f0a9c31f/quotes/:id/status", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken || accessToken === Deno.env.get("SUPABASE_ANON_KEY")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: isAdminRes, error: aerr } = await db.rpc("is_admin", { uid: user.id });
    if (aerr) return c.json({ error: aerr.message }, 400);
    if (!isAdminRes) return c.json({ error: "Forbidden - Admin access required" }, 403);

    const quoteId = c.req.param("id");
    const { status } = await c.req.json();
    if (!["new", "contacted", "booked", "completed"].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }
    const { data, error } = await db
      .from("quotes")
      .update({ status })
      .eq("id", quoteId)
      .select("*")
      .single();
    if (error) return c.json({ error: error.message }, 400);
    if (!data) return c.json({ error: "Quote not found" }, 404);
    return c.json({ success: true, quote: data });
  } catch (error) {
    console.error("Update quote status error:", error);
    return c.json({ error: "Failed to update quote status" }, 500);
  }
});

// Newsletter subscription
app.post("/make-server-f0a9c31f/newsletter", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { error } = await db
      .from("newsletter_subscribers")
      .insert({ email });
    if (error) {
      // Unique violation handling
      if (error.message.includes("duplicate key")) {
        return c.json({ success: true, message: "Already subscribed" });
      }
      return c.json({ error: error.message }, 400);
    }
    return c.json({ success: true, message: "Successfully subscribed to newsletter" });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return c.json({ error: "Failed to subscribe" }, 500);
  }
});

// Get user profile
app.get("/make-server-f0a9c31f/profile", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken || accessToken === Deno.env.get("SUPABASE_ANON_KEY")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: profile, error: perr } = await db
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (perr) return c.json({ error: perr.message }, 400);
    if (!profile) return c.json({ error: "Profile not found" }, 404);
    return c.json({ success: true, profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

Deno.serve(app.fetch);
