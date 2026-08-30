import express from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { getKpisSummary } from './kpis.service.js';

const router = express.Router();

router.get('/summary', asyncHandler((_req, res) => {
  const s = getKpisSummary();
  res.json(s);
}));

export default router;
