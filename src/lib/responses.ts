export function jsonOk(data: any, init?: ResponseInit) {
  return Response.json({ success: true, data }, init);
}

export function jsonError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

