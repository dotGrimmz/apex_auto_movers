import { createAdminClient } from '@/src/lib/supabaseServer';
import { jsonOk, jsonError } from '@/src/lib/responses';
import { isSignupBody } from '@/src/lib/validation';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!isSignupBody(body)) return jsonError('Email, password, and name are required', 400);
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      user_metadata: { name: body.name },
      email_confirm: true,
    });
    if (error) return jsonError(error.message, 400);
    await admin.from('profiles').update({ name: body.name }).eq('user_id', data.user.id);
    return jsonOk({ id: data.user.id, email: body.email, name: body.name });
  } catch (e: any) {
    return jsonError(e?.message || 'Failed to create account', 500);
  }
}

