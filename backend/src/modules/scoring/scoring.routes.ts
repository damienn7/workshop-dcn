import express from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { getCaseByNumber, setRefusal } from '../cases/cases.service';
import { calculateScoreForCase, validateManualOfferAdjustment } from './scoring.service';
import { ApiError } from '../../shared/ApiError';

const router = express.Router();

router.post('/:caseNumber/score', asyncHandler((req, res) => {
  const c = getCaseByNumber(req.params.caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  // Ensure diagnosis exists
  if (!c.diagnosis) throw new ApiError(400, 'Scoring impossible: diagnostic incomplet', ['Diagnostic non démarré']);
  const result = calculateScoreForCase(c);
  res.json(result);
}));

router.get('/:caseNumber/score', asyncHandler((req, res) => {
  const c = getCaseByNumber(req.params.caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  if (c.scoring) return res.json(c.scoring);
  if (!c.diagnosis) throw new ApiError(400, 'Scoring impossible: diagnostic incomplet', ['Diagnostic non démarré']);
  const result = calculateScoreForCase(c);
  res.json(result);
}));

router.post('/:caseNumber/decision/accept', asyncHandler((req, res) => {
  const c = getCaseByNumber(req.params.caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  const body = req.body as { finalOffer: number; manualAdjustment?: boolean; adjustmentReason?: string | null };
  if (!c.scoring) throw new ApiError(400, 'Scoring manquant');
  const suggested = c.scoring.finalOffer;
  if (body.manualAdjustment) {
    validateManualOfferAdjustment({ suggestedOffer: suggested, adjustedOffer: body.finalOffer, reason: body.adjustmentReason ?? undefined });
    c.finalOffer = body.finalOffer;
  } else {
    c.finalOffer = suggested;
  }
  c.status = 'accepted';
  c.completedAt = new Date().toISOString();
  res.json({ message: 'Accepté', finalOffer: c.finalOffer });
}));

router.post('/:caseNumber/decision/refuse', asyncHandler((req, res) => {
  const c = getCaseByNumber(req.params.caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  const body = req.body as { reasons?: string[]; alternatives?: string[] };
  const reasons = body.reasons ?? [];
  const updated = setRefusal(req.params.caseNumber, reasons);
  res.json({ message: 'Refusé', reasons: updated.refusalReasons ?? [], alternatives: body.alternatives ?? [] });
}));

export default router;
