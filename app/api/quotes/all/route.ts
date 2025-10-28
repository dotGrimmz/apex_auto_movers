import { createAdminClient } from '@/src/lib/supabaseServer';
import { jsonOk, jsonError } from '@/src/lib/responses';
import { requireAdmin } from '@/src/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const adminUser = await requireAdmin();
  if (!adminUser) return jsonError('Forbidden', 403);
  const admin = createAdminClient();
  const { data, error } = await admin.from('quotes').select('*').order('created_at', { ascending: false });
  if (error) return jsonError(error.message, 400);
  return jsonOk(data ?? []);
}

