import type { Provider } from '@supabase/supabase-js';
import { createClient } from './supabase/client';

export type SupportedOAuthProvider = Extract<Provider, 'google' | 'facebook'>;
export const SUPPORTED_OAUTH_PROVIDERS: readonly SupportedOAuthProvider[] = ['google', 'facebook'];

interface AuthErrorContext {
  action: string;
  details?: Record<string, unknown>;
}

export class AuthError extends Error {
  readonly context: AuthErrorContext;
  readonly originalError?: unknown;

  constructor(message: string, context: AuthErrorContext, originalError?: unknown) {
    super(message);
    this.name = 'AuthError';
    this.context = context;
    this.originalError = originalError;
  }
}

type LogLevel = 'info' | 'warn' | 'error';

function logAuthEvent(level: LogLevel, message: string, context: Record<string, unknown> = {}) {
  const payload = { scope: 'auth', message, ...context };
  if (level === 'error') {
    console.error(payload);
  } else if (level === 'warn') {
    console.warn(payload);
  } else {
    console.info(payload);
  }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  logAuthEvent('info', 'signIn.start', { authType: 'password', email });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      logAuthEvent('error', 'signIn.failure', {
        authType: 'password',
        email,
        errorMessage: error.message,
        errorStatus: 'status' in error ? error.status : undefined,
      });
      throw new AuthError('Unable to sign in with the provided credentials.', { action: 'signIn', details: { email } }, error);
    }

    logAuthEvent('info', 'signIn.success', {
      authType: 'password',
      userId: data.user?.id ?? null,
      sessionExpiresAt: data.session?.expires_at ?? null,
    });
    return data;
  } catch (err) {
    if (err instanceof AuthError) {
      throw err;
    }
    logAuthEvent('error', 'signIn.unexpected', { authType: 'password', email, error: err });
    throw new AuthError('An unexpected error occurred while signing in.', { action: 'signIn', details: { email } }, err);
  }
}

export async function signOut() {
  const supabase = createClient();
  logAuthEvent('info', 'signOut.start', {});
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logAuthEvent('error', 'signOut.failure', { errorMessage: error.message });
      throw new AuthError('Unable to sign out at this time.', { action: 'signOut' }, error);
    }
    logAuthEvent('info', 'signOut.success', {});
  } catch (err) {
    if (err instanceof AuthError) {
      throw err;
    }
    logAuthEvent('error', 'signOut.unexpected', { error: err });
    throw new AuthError('An unexpected error occurred while signing out.', { action: 'signOut' }, err);
  }
}

export async function getSession() {
  const supabase = createClient();
  logAuthEvent('info', 'getSession.start', {});

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      logAuthEvent('error', 'getSession.failure', { errorMessage: error.message });
      throw new AuthError('Unable to retrieve the current session.', { action: 'getSession' }, error);
    }

    logAuthEvent('info', 'getSession.success', { hasSession: Boolean(session) });
    return session;
  } catch (err) {
    if (err instanceof AuthError) {
      throw err;
    }
    logAuthEvent('error', 'getSession.unexpected', { error: err });
    throw new AuthError('An unexpected error occurred while retrieving the session.', { action: 'getSession' }, err);
  }
}

export async function getCurrentUser() {
  const supabase = createClient();
  logAuthEvent('info', 'getCurrentUser.start', {});

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logAuthEvent('error', 'getCurrentUser.failure', { errorMessage: error.message });
      throw new AuthError('Unable to retrieve the current user.', { action: 'getCurrentUser' }, error);
    }

    logAuthEvent('info', 'getCurrentUser.success', { userId: user?.id ?? null });
    return user;
  } catch (err) {
    if (err instanceof AuthError) {
      throw err;
    }
    logAuthEvent('error', 'getCurrentUser.unexpected', { error: err });
    throw new AuthError('An unexpected error occurred while retrieving the current user.', { action: 'getCurrentUser' }, err);
  }
}

export async function signInWithOAuth(provider: SupportedOAuthProvider, redirectTo?: string) {
  const supabase = createClient();

  logAuthEvent('info', 'signInWithOAuth.start', { provider, redirectTo: redirectTo ?? null });

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: redirectTo ? { redirectTo } : undefined,
    });

    if (error) {
      logAuthEvent('error', 'signInWithOAuth.failure', { provider, errorMessage: error.message });
      throw new AuthError(`Unable to initiate ${provider} authentication.`, { action: 'signInWithOAuth', details: { provider } }, error);
    }

    logAuthEvent('info', 'signInWithOAuth.redirect', {
      provider,
      url: data?.url ?? null,
    });

    return data;
  } catch (err) {
    if (err instanceof AuthError) {
      throw err;
    }
    logAuthEvent('error', 'signInWithOAuth.unexpected', { provider, error: err });
    throw new AuthError(`An unexpected error occurred while initiating ${provider} authentication.`, { action: 'signInWithOAuth', details: { provider } }, err);
  }
}
