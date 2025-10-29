export async function parseJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function notFoundResponse() {
  return new Response(null, {
    status: 404,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
