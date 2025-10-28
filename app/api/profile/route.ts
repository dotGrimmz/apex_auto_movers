import { createAdminClient } from '@/src/lib/supabaseServer';
import { jsonOk, jsonError } from '@/src/lib/responses';
import { requireUser } from '@/src/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const user = await requireUser();
  if (!user) return jsonError('Unauthorized', 401);
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) return jsonError(error.message, 400);
  if (!profile) return jsonError('Profile not found', 404);
  return jsonOk(profile);
}

