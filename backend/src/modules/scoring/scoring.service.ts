import { ApiError } from '../../shared/ApiError';
import { getCaseByNumber, updateCase, setFinalOffer } from '../cases/cases.service';
import { scoringConfig } from '../../data/scoring.config';
import { getBuybackBaseValue, mapValueToScore } from './scoring.engine';
import type { ScoringResult, RepairItem } from './scoring.types';

function computeCategoryScores(diagnosis: any, preDiagnostic: any) {
  const categories: Record<string, number> = {
    frameFork: 0,
    brakes: 0,
    transmission: 0,
    wheelsTires: 0,
    finishing: 0
  };

  // Frame & fork
  const f = diagnosis?.frameFork ?? preDiagnostic;
  categories.frameFork = Math.round((mapValueToScore(f?.generalCondition) + mapValueToScore(f?.fork) + (f?.shockDeformation ? mapValueToScore(f.shockDeformation) : 100)) / 3);

  // Brakes
  const b = diagnosis?.brakes ?? preDiagnostic;
  categories.brakes = Math.round((mapValueToScore(b?.frontEfficiency) + mapValueToScore(b?.rearEfficiency) + (b?.padsWear ? (b.padsWear.includes('replace') ? 25 : 80) : 80)) / 3);

  // Transmission
  const t = diagnosis?.transmission ?? preDiagnostic;
  categories.transmission = Math.round((mapValueToScore(t?.chain) + mapValueToScore(t?.derailleur) + mapValueToScore(t?.bottomBracket || 'good')) / 3);

  // Wheels & tires
  const w = diagnosis?.wheelsTires ?? preDiagnostic;
  categories.wheelsTires = Math.round((mapValueToScore(w?.rims) + mapValueToScore(w?.tires) + mapValueToScore(w?.hubs)) / 3);

  // Finishing
  const fin = diagnosis?.finishing ?? preDiagnostic;
  categories.finishing = Math.round((mapValueToScore(fin?.saddle) + mapValueToScore(fin?.handlebarDirection) + mapValueToScore(fin?.cleanliness)) / 3);

  return categories;
}

function computeRepairsAndBlocking(diagnosis: any, item: any) {
  const repairs: RepairItem[] = [];
  const blocking: string[] = [];
  const costs = scoringConfig.repairCosts as any;

  const frame = diagnosis?.frameFork ?? {};
  if (String(frame.shockDeformation || '').toLowerCase().includes('shock') || String(frame.shockDeformation || '').toLowerCase().includes('yes')) {
    blocking.push('Cadre avec choc ou déformation');
  }
  if (String(frame.fork || '').toLowerCase().includes('out_of_service') || String(frame.fork || '').toLowerCase().includes('out')) {
    blocking.push('Fourche hors service');
  }

  // Brakes
  const brakes = diagnosis?.brakes ?? {};
  if (String(brakes.padsWear || '').toLowerCase().includes('replace')) {
    repairs.push({ code: 'brakePads', label: 'Remplacement patins', amount: costs.brakePads });
  }

  // Finishing cleaning
  const fin = diagnosis?.finishing ?? {};
  if (String(fin.cleanliness || '').toLowerCase().includes('cleaning')) {
    repairs.push({ code: 'cleaning', label: 'Nettoyage complet', amount: costs.cleaning });
  }

  // Transmission
  const transmission = diagnosis?.transmission ?? {};
  if (String(transmission.derailleur || '').toLowerCase().includes('medium') || String(transmission.derailleur || '').toLowerCase().includes('bad')) {
    repairs.push({ code: 'derailleurAdjustment', label: 'Réglage dérailleur', amount: costs.derailleurAdjustment });
  }
  if (String(transmission.chain || '').toLowerCase().includes('replace')) {
    repairs.push({ code: 'chainReplacement', label: 'Remplacement chaîne', amount: costs.chainReplacement });
  }

  // Wheels / tires
  const wheels = diagnosis?.wheelsTires ?? {};
  if (String(wheels.tires || '').toLowerCase().includes('replace')) {
    repairs.push({ code: 'tireReplacement', label: 'Remplacement pneu', amount: costs.tireReplacement });
  }
  if (String(wheels.rims || '').toLowerCase().includes('medium')) {
    repairs.push({ code: 'wheelTruing', label: 'Surfaçage / voile', amount: costs.wheelTruing });
  }

  // Direction
  if (String(fin.handlebarDirection || '').toLowerCase().includes('danger') || String(fin.handlebarDirection || '').toLowerCase().includes('bad')) {
    blocking.push('Direction dangereuse');
    repairs.push({ code: 'directionRepair', label: 'Réparation direction', amount: costs.directionRepair });
  }

  return { repairs, blocking };
}

export function calculateScoreForCase(caseObj: any): ScoringResult {
  const diagnosis = caseObj.diagnosis || {};
  const pre = caseObj.preDiagnostic || {};
  const categoryScores = computeCategoryScores(diagnosis, pre);

  const totalWeight = Object.values(scoringConfig.categories).reduce((s, c) => s + c.weight, 0);
  const weighted = Object.entries(categoryScores).reduce((acc, [key, score]) => {
    const weight = (scoringConfig as any).categories[key]?.weight ?? 0;
    return acc + score * weight;
  }, 0);
  const technicianScore = Math.round(weighted / Math.max(1, totalWeight));

  const { repairs, blocking } = computeRepairsAndBlocking(diagnosis, caseObj.item);
  const repairsTotal = repairs.reduce((s, r) => s + r.amount, 0);

  const baseBuybackValue = getBuybackBaseValue(caseObj.item.estimatedBasePrice ?? caseObj.onlineEstimate ?? 0, technicianScore);

  const recond = scoringConfig.margins.reconditioning;
  const risk = scoringConfig.margins.defaultRisk;

  let finalOffer = baseBuybackValue - repairsTotal - recond - risk;
  finalOffer = Math.round(finalOffer / 5) * 5;
  if (blocking.length > 0) finalOffer = 0;

  const decision = blocking.length > 0 ? 'refused' : technicianScore >= scoringConfig.decisionThresholds.accepted ? 'accepted' : technicianScore >= scoringConfig.decisionThresholds.conditional ? 'conditional' : 'refused';

  const gapPercent = caseObj.onlineEstimate ? Math.round(((caseObj.onlineEstimate - finalOffer) / Math.max(1, caseObj.onlineEstimate)) * 100) : 0;

  const explanations: string[] = repairs.map(r => `${r.label} : impact de -${r.amount} € sur l'offre.`);

  const result: ScoringResult = {
    customerScore: caseObj.customerScore ?? null,
    technicianScore,
    decision: decision as any,
    onlineEstimate: caseObj.onlineEstimate ?? null,
    finalOffer,
    gapPercent,
    categoryScores,
    blockingReasons: blocking,
    repairCosts: repairs,
    priceBreakdown: {
      baseValue: baseBuybackValue,
      repairs: repairsTotal,
      reconditioningMargin: recond,
      riskMargin: risk,
      finalOffer
    },
    explanations
  };

  // persist into case; if there are blocking reasons, mirror them to `refusalReasons`
  const partial: any = { scoring: result, finalOffer: result.finalOffer };
  if (blocking.length > 0) partial.refusalReasons = blocking;
  updateCase(caseObj.caseNumber, partial);

  return result;
}

export function validateManualOfferAdjustment({ suggestedOffer, adjustedOffer, reason }: { suggestedOffer: number; adjustedOffer: number; reason?: string; }) {
  const lower = Math.round(suggestedOffer * (1 - 0.15));
  const upper = Math.round(suggestedOffer * (1 + 0.15));
  if (adjustedOffer < lower || adjustedOffer > upper) {
    throw new ApiError(400, 'Ajustement hors fourchette autorisée', [`L'offre ajustée doit être entre ${lower} et ${upper} €`]);
  }
  if (adjustedOffer !== suggestedOffer && (!reason || String(reason).trim().length === 0)) {
    throw new ApiError(400, 'Motif obligatoire pour ajustement manuel');
  }
  return true;
}
