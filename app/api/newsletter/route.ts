import { createAdminClient } from '@/src/lib/supabaseServer';
import { jsonOk, jsonError } from '@/src/lib/responses';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return jsonError('Email is required', 400);
    const admin = createAdminClient();
    const { error } = await admin.from('newsletter_subscribers').insert({ email });
    if (error) {
      if (String(error.message).toLowerCase().includes('duplicate')) {
        return jsonOk({ message: 'Already subscribed' });
      }
      return jsonError(error.message, 400);
    }
    return jsonOk({ message: 'Successfully subscribed to newsletter' });
  } catch (e: any) {
    return jsonError(e?.message || 'Failed to subscribe', 500);
  }
}

