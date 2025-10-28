import { createAdminClient } from '@/src/lib/supabaseServer';
import { jsonOk, jsonError } from '@/src/lib/responses';
import { requireUser } from '@/src/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return jsonError('Unauthorized', 401);
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return jsonError(error.message, 400);
    return jsonOk(data ?? []);
  } catch (e: any) {
    return jsonError(e?.message || 'Failed to fetch quotes', 500);
  }
}

