import { Router } from "express";
import { jsonOk, jsonError } from "../lib/responses";
import { createAdminClient } from "../lib/supabase";
import { requireUser, requireAdmin } from "../lib/auth";
import { isValidStatus } from "../lib/validation";

const router = Router();

router.get("/my", async (req, res) => {
  try {
    // user is null or not showing
    const user = await requireUser(req);
    console.log({ user });
    if (!user) return jsonError(res, "Unauthorized", 401);
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("quotes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return jsonError(res, error.message, 400);
    return jsonOk(res, data ?? []);
  } catch (e: any) {
    return jsonError(res, e?.message || "Failed to fetch quotes", 500);
  }
});

router.get("/all", async (req, res) => {
  const adminUser = await requireAdmin(req);
  if (!adminUser) return jsonError(res, "Forbidden", 403);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return jsonError(res, error.message, 400);
  return jsonOk(res, data ?? []);
});

router.patch("/:id/status", async (req, res) => {
  const adminUser = await requireAdmin(req);
  if (!adminUser) return jsonError(res, "Forbidden", 403);
  const { id } = req.params;
  const status = (req.body || {}).status;
  if (!isValidStatus(status)) return jsonError(res, "Invalid status", 400);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("quotes")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return jsonError(res, error.message, 400);
  if (!data) return jsonError(res, "Quote not found", 404);
  return jsonOk(res, data);
});

export default router;
