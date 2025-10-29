import { Router } from 'express';
import { jsonOk, jsonError } from '../lib/responses';
import { isSignupBody } from '../lib/validation';
import { createAdminClient } from '../lib/supabase';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const body = req.body;
    if (!isSignupBody(body)) return jsonError(res, 'Email, password, and name are required', 400);
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      user_metadata: { name: body.name },
      email_confirm: true,
    });
    if (error) return jsonError(res, error.message, 400);
    await admin.from('profiles').update({ name: body.name }).eq('user_id', data.user.id);
    return jsonOk(res, { id: data.user.id, email: body.email, name: body.name });
  } catch (e: any) {
    return jsonError(res, e?.message || 'Failed to create account', 500);
  }
});

export default router;

