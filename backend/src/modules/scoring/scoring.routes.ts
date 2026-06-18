import express from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { getCaseByNumber, setRefusal, setFinalOffer } from '../cases/cases.service';
import { calculateScoreForCase, validateManualOfferAdjustment } from './scoring.service';
import { ApiError } from '../../shared/ApiError';
import prisma from '../../db/prisma';

const router = express.Router();

router.post('/:caseNumber/score', asyncHandler(async (req, res) => {
  const c = await getCaseByNumber(req.params.caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  // Ensure diagnosis exists
  if (!c.diagnosis) throw new ApiError(400, 'Scoring impossible: diagnostic incomplet', ['Diagnostic non démarré']);
  const result = await calculateScoreForCase(c);
  res.json(result);
}));

router.get('/:caseNumber/score', asyncHandler(async (req, res) => {
  const c = await getCaseByNumber(req.params.caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  if (c.scoring) return res.json(c.scoring);
  if (!c.diagnosis) throw new ApiError(400, 'Scoring impossible: diagnostic incomplet', ['Diagnostic non démarré']);
  const result = await calculateScoreForCase(c);
  res.json(result);
}));

router.post('/:caseNumber/decision/accept', asyncHandler(async (req, res) => {
  const c = await getCaseByNumber(req.params.caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  const body = req.body as { finalOffer: number; manualAdjustment?: boolean; adjustmentReason?: string | null };
  if (!c.scoring) throw new ApiError(400, 'Scoring manquant');
  const suggested = c.scoring.finalOffer;
  let finalOffer = suggested;
  if (body.manualAdjustment) {
    validateManualOfferAdjustment({ suggestedOffer: suggested, adjustedOffer: body.finalOffer, reason: body.adjustmentReason ?? undefined });
    finalOffer = body.finalOffer;
  }

  // persist decision
  const dbCase = await prisma.buybackCase.findUnique({ where: { caseNumber: req.params.caseNumber } });
  if (!dbCase) throw new ApiError(404, 'Dossier introuvable');
  await prisma.decision.upsert({
    where: { caseId: dbCase.id },
    update: {
      status: 'accepted',
      finalOffer: finalOffer,
      manualAdjustment: body.manualAdjustment ?? false,
      adjustmentReason: body.adjustmentReason ?? null,
      completedAt: new Date()
    },
    create: {
      caseId: dbCase.id,
      status: 'accepted',
      finalOffer: finalOffer,
      manualAdjustment: body.manualAdjustment ?? false,
      adjustmentReason: body.adjustmentReason ?? null,
      completedAt: new Date()
    }
  });
  await setFinalOffer(req.params.caseNumber, finalOffer);
  await prisma.buybackCase.update({ where: { caseNumber: req.params.caseNumber }, data: { status: 'accepted' } });
  res.json({ message: 'Accepté', finalOffer });
}));

router.post('/:caseNumber/decision/refuse', asyncHandler(async (req, res) => {
  const c = await getCaseByNumber(req.params.caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  const body = req.body as { reasons?: string[]; alternatives?: string[] };
  const reasons = body.reasons ?? [];
  const updated = await setRefusal(req.params.caseNumber, reasons);
  res.json({ message: 'Refusé', reasons: updated.refusalReasons ?? [], alternatives: body.alternatives ?? [] });
}));

export default router;
