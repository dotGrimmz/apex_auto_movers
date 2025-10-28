import { Router } from 'express';
import { jsonOk } from '../lib/responses';

const router = Router();

router.get('/', (_req, res) => {
  return jsonOk(res, { status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

