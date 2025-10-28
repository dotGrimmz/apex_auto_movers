import type { Response } from 'express';

export function jsonOk(res: Response, data: any, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function jsonError(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

