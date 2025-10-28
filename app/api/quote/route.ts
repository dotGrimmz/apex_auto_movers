import { createAdminClient } from '@/src/lib/supabaseServer';
import { jsonOk, jsonError } from '@/src/lib/responses';
import { isQuoteBody } from '@/src/lib/validation';
import { getUserFromRequest } from '@/src/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!isQuoteBody(body)) return jsonError('Invalid quote payload', 400);
    const admin = createAdminClient();
    const { user } = await getUserFromRequest();
    const insert = {
      user_id: user?.id ?? null,
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
    if (error) return jsonError(error.message, 400);
    return jsonOk(data);
  } catch (e: any) {
    return jsonError(e?.message || 'Failed to submit quote', 500);
  }
}

