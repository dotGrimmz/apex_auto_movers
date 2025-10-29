import { Router } from 'express';
import { jsonOk, jsonError } from '../lib/responses';
import { isQuoteBody } from '../lib/validation';
import { createAdminClient } from '../lib/supabase';
import { getBearerToken } from '../lib/auth';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!isQuoteBody(body)) return jsonError(res, 'Invalid quote payload', 400);
    const admin = createAdminClient();
    let userId: string | null = null;
    const token = getBearerToken(req);
    if (token) {
      const { data } = await admin.auth.getUser(token);
      userId = data?.user?.id ?? null;
    }
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
      status: 'new' as const,
    };
    const { data, error } = await admin.from('quotes').insert(insert).select('*').single();
    if (error) return jsonError(res, error.message, 400);
    return jsonOk(res, data);
  } catch (e: any) {
    return jsonError(res, e?.message || 'Failed to submit quote', 500);
  }
});

export default router;

