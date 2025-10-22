export function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const ENV = {
  SUPABASE_URL: () => requireEnv("SUPABASE_URL"),
  SERVICE_KEY: () => requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  ANON_KEY: () => requireEnv("SUPABASE_ANON_KEY"),
};

