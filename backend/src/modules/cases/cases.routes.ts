import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../shared/asyncHandler';
import * as service from './cases.service';
import { NewCaseSchema } from './cases.schemas';
import { ApiError } from '../../shared/ApiError';

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const list = await service.listCasesCompact();
  res.json(list);
}));

router.get('/:caseNumber', asyncHandler(async (req, res) => {
  const c = await service.getCaseByNumber(req.params.caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  res.json(c);
}));

router.post('/', asyncHandler(async (req, res) => {
  const parsed = NewCaseSchema.safeParse(req.body);
  if (!parsed.success) {
    // allow a minimal creation flow for in-store cases
    if (req.body && (req.body.withoutPreDiagnostic || req.body.source === 'in_store')) {
      const created = await service.createCaseMinimal(req.body);
      return res.status(201).json(created);
    }
    const err = parsed.error;
    throw new ApiError(400, 'Données invalides', err.errors.map(e => e.message));
  }
  const created = await service.createCase(parsed.data);
  res.status(201).json(created);
}));

export default router;
