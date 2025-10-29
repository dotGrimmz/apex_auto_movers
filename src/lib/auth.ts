import { headers } from 'next/headers';
import { createAdminClient } from './supabaseServer';

export async function getBearerToken() {
  const h = await headers();
  const auth = h.get('authorization') || h.get('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
  return token;
}

export async function getUserFromRequest() {
  const token = await getBearerToken();
  if (!token) return { user: null } as const;
  const admin = createAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { user: null } as const;
  return { user: data.user } as const;
}

export async function requireUser() {
  const { user } = await getUserFromRequest();
  if (!user) return null;
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('is_admin', { uid: user.id });
  if (error || !data) return null;
  return user;
}

