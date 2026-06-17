import { CASES } from '../../data/cases.mock';
import { NewCasePayload, BuybackCase } from './cases.schemas';
import { ApiError } from '../../shared/ApiError';

export function listCasesCompact() {
  return CASES.map(c => ({
    id: c.id,
    caseNumber: c.caseNumber,
    status: c.status,
    customerName: `${c.customer.firstName} ${c.customer.lastName}`,
    itemLabel: `${c.item.brand} ${c.item.model}`,
    customerScore: c.customerScore ?? null,
    onlineEstimate: c.onlineEstimate ?? null,
    finalOffer: c.finalOffer ?? null
  }));
}

export function getCaseByNumber(caseNumber: string): BuybackCase | undefined {
  return CASES.find(c => c.caseNumber === caseNumber);
}

export function createCase(payload: NewCasePayload): BuybackCase {
  const id = `case_${Date.now()}`;
  const random = Math.floor(10000 + Math.random() * 90000);
  const caseNumber = `DEC-${random}`;
  const newCase: BuybackCase = {
    id,
    caseNumber,
    status: 'pending',
    customer: payload.customer,
    item: payload.item as any,
    customerScore: 0,
    onlineEstimate: payload.item.estimatedBasePrice ?? 0,
    finalOffer: null
  } as BuybackCase;

  CASES.unshift(newCase);
  return newCase;
}

export function updateCase(caseNumber: string, partial: Partial<BuybackCase>): BuybackCase {
  const c = getCaseByNumber(caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  Object.assign(c, partial);
  return c;
}

export function setCaseStatus(caseNumber: string, status: BuybackCase['status']) {
  const c = getCaseByNumber(caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  c.status = status;
  return c;
}

export function setFinalOffer(caseNumber: string, offer: number | null) {
  const c = getCaseByNumber(caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  c.finalOffer = offer;
  return c;
}

export function setRefusal(caseNumber: string, reasons: string[]) {
  const c = getCaseByNumber(caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  c.refusalReasons = reasons;
  c.finalOffer = 0;
  c.status = 'refused';
  c.completedAt = new Date().toISOString();
  // Keep scoring.blockingReasons in sync when a manual refusal is applied
  if (!c.scoring) c.scoring = {} as any;
  (c.scoring as any).blockingReasons = reasons;
  return c;
}
