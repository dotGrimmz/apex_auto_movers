import { Router } from 'express';
import { jsonOk, jsonError } from '../lib/responses';
import { createAdminClient } from '../lib/supabase';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return jsonError(res, 'Email is required', 400);
    const admin = createAdminClient();
    const { error } = await admin.from('newsletter_subscribers').insert({ email });
    if (error) {
      if (String(error.message).toLowerCase().includes('duplicate')) return jsonOk(res, { message: 'Already subscribed' });
      return jsonError(res, error.message, 400);
    }
    return jsonOk(res, { message: 'Successfully subscribed to newsletter' });
  } catch (e: any) {
    return jsonError(res, e?.message || 'Failed to subscribe', 500);
  }
});

export default router;

