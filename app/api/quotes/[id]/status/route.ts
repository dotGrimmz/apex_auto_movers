import { createAdminClient } from '@/src/lib/supabaseServer';
import { jsonOk, jsonError } from '@/src/lib/responses';
import { requireAdmin } from '@/src/lib/auth';
import { isValidStatus } from '@/src/lib/validation';

export const runtime = 'nodejs';

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const adminUser = await requireAdmin();
  if (!adminUser) return jsonError('Forbidden', 403);
  try {
    const body = await _req.json();
    const status = body?.status;
    if (!isValidStatus(status)) return jsonError('Invalid status', 400);
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('quotes')
      .update({ status })
      .eq('id', params.id)
      .select('*')
      .single();
    if (error) return jsonError(error.message, 400);
    if (!data) return jsonError('Quote not found', 404);
    return jsonOk(data);
  } catch (e: any) {
    return jsonError(e?.message || 'Failed to update quote status', 500);
  }
}

