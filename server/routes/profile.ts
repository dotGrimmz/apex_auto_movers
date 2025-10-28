import { Router } from 'express';
import { jsonOk, jsonError } from '../lib/responses';
import { createAdminClient } from '../lib/supabase';
import { requireUser } from '../lib/auth';

const router = Router();

router.get('/', async (req, res) => {
  const user = await requireUser(req);
  if (!user) return jsonError(res, 'Unauthorized', 401);
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) return jsonError(res, error.message, 400);
  if (!profile) return jsonError(res, 'Profile not found', 404);
  return jsonOk(res, profile);
});

export default router;

