import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../shared/asyncHandler';
import * as service from './cases.service';
import { NewCaseSchema } from './cases.schemas';
import { ApiError } from '../../shared/ApiError';

const router = express.Router();

router.get('/', asyncHandler((_req, res) => {
  const list = service.listCasesCompact();
  res.json(list);
}));

router.get('/:caseNumber', asyncHandler((req, res) => {
  const c = service.getCaseByNumber(req.params.caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  res.json(c);
}));

router.post('/', asyncHandler((req, res) => {
  const parsed = NewCaseSchema.safeParse(req.body);
  if (!parsed.success) {
    const err = parsed.error;
    throw new ApiError(400, 'Données invalides', err.errors.map(e => e.message));
  }
  const created = service.createCase(parsed.data);
  res.status(201).json(created);
}));

export default router;
