export const runtime = 'nodejs';

export async function GET() {
  return Response.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
}

