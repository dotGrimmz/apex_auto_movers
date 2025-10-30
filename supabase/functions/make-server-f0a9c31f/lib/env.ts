export type AppConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
};

let cachedConfig: AppConfig | null = null;

function readEnv(key: string): string {
  try {
    const value = Deno.env.get(key);
    if (!value) throw new Error(`Missing environment variable: ${key}`);
    return value;
  } catch (error) {
    console.error(`[env] Unable to read ${key}:`, error);
    throw new Error(`Environment not configured for ${key}`);
  }
}

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const supabaseUrl = readEnv("SUPABASE_URL");
  const supabaseAnonKey = readEnv("SUPABASE_ANON_KEY");
  const supabaseServiceKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  cachedConfig = {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
  };

  return cachedConfig;
}
