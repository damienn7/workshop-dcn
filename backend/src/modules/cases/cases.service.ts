import prisma from '../../db/prisma';
import { NewCasePayload, BuybackCase } from './cases.schemas';
import { ApiError } from '../../shared/ApiError';

function mapDbCaseToApi(dbCase: any): BuybackCase {
  if (!dbCase) return undefined as any;
  const pre = dbCase.preDiagnostic ? {
    generalState: dbCase.preDiagnostic.generalState,
    frame: dbCase.preDiagnostic.frame,
    brakes: dbCase.preDiagnostic.brakes,
    transmission: dbCase.preDiagnostic.transmission,
    wheels: dbCase.preDiagnostic.wheels,
    photos: dbCase.preDiagnostic.photosJson ? JSON.parse(dbCase.preDiagnostic.photosJson) : undefined
  } : undefined;

  const diagnosis = dbCase.diagnosis ? {
    identification: dbCase.diagnosis.identificationJson ? JSON.parse(dbCase.diagnosis.identificationJson) : null,
    frameFork: dbCase.diagnosis.frameForkJson ? JSON.parse(dbCase.diagnosis.frameForkJson) : null,
    brakes: dbCase.diagnosis.brakesJson ? JSON.parse(dbCase.diagnosis.brakesJson) : null,
    transmission: dbCase.diagnosis.transmissionJson ? JSON.parse(dbCase.diagnosis.transmissionJson) : null,
    wheelsTires: dbCase.diagnosis.wheelsTiresJson ? JSON.parse(dbCase.diagnosis.wheelsTiresJson) : null,
    finishing: dbCase.diagnosis.finishingJson ? JSON.parse(dbCase.diagnosis.finishingJson) : null,
  } : undefined;

  const scoring = dbCase.scoreResult ? {
    customerScore: dbCase.scoreResult.customerScore,
    technicianScore: dbCase.scoreResult.technicianScore,
    decision: dbCase.scoreResult.decision,
    onlineEstimate: dbCase.scoreResult.onlineEstimate,
    finalOffer: dbCase.scoreResult.finalOffer,
    gapPercent: dbCase.scoreResult.gapPercent,
    categoryScores: dbCase.scoreResult.categoryScoresJson ? JSON.parse(dbCase.scoreResult.categoryScoresJson) : undefined,
    blockingReasons: dbCase.scoreResult.blockingReasonsJson ? JSON.parse(dbCase.scoreResult.blockingReasonsJson) : [],
    repairCosts: dbCase.scoreResult.repairCostsJson ? JSON.parse(dbCase.scoreResult.repairCostsJson) : [],
    priceBreakdown: dbCase.scoreResult.priceBreakdownJson ? JSON.parse(dbCase.scoreResult.priceBreakdownJson) : undefined,
    explanations: dbCase.scoreResult.explanationsJson ? JSON.parse(dbCase.scoreResult.explanationsJson) : []
  } : undefined;

  const apiCase: BuybackCase = {
    id: dbCase.id,
    caseNumber: dbCase.caseNumber,
    status: dbCase.status,
    customer: {
      firstName: dbCase.customer.firstName,
      lastName: dbCase.customer.lastName,
      phone: dbCase.customer.phone ?? undefined,
      email: dbCase.customer.email ?? undefined
    },
    item: {
      articleType: dbCase.articleType,
      category: dbCase.category ?? undefined,
      brand: dbCase.brand ?? undefined,
      model: dbCase.model ?? undefined,
      year: dbCase.year ?? undefined,
      frameSize: dbCase.frameSize ?? undefined,
      serialNumber: dbCase.serialNumber ?? undefined,
      declaredKm: dbCase.declaredKm ?? undefined,
      estimatedBasePrice: dbCase.estimatedBasePrice ?? undefined
    },
    preDiagnostic: pre,
    customerScore: dbCase.customerScore ?? undefined,
    onlineEstimate: dbCase.onlineEstimate ?? undefined,
    finalOffer: dbCase.finalOffer ?? undefined,
    diagnosis,
    scoring
  } as BuybackCase;

  return apiCase;
}

export async function listCasesCompact() {
  const list = await prisma.buybackCase.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  });
  return list.map(c => ({
    id: c.id,
    caseNumber: c.caseNumber,
    status: c.status,
    customerName: `${c.customer.firstName} ${c.customer.lastName}`,
    itemLabel: `${c.brand ?? ''} ${c.model ?? ''}`.trim(),
    customerScore: c.customerScore ?? null,
    onlineEstimate: c.onlineEstimate ?? null,
    finalOffer: c.finalOffer ?? null
  }));
}

export async function getCaseByNumber(caseNumber: string): Promise<BuybackCase | undefined> {
  const c = await prisma.buybackCase.findUnique({
    where: { caseNumber },
    include: { customer: true, preDiagnostic: true, diagnosis: true, scoreResult: true, decision: true }
  });
  return mapDbCaseToApi(c);
}

export async function createCase(payload: NewCasePayload) {
  const created = await prisma.buybackCase.create({
    data: {
      caseNumber: `DEC-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'pending',
      customer: { create: payload.customer as any },
      articleType: (payload as any).item.articleType ?? 'bike',
      category: (payload as any).item.category,
      brand: (payload as any).item.brand,
      model: (payload as any).item.model,
      year: (payload as any).item.year,
      frameSize: (payload as any).item.frameSize,
      serialNumber: (payload as any).item.serialNumber,
      declaredKm: (payload as any).item.declaredKm,
      estimatedBasePrice: (payload as any).item.estimatedBasePrice ?? undefined,
      customerScore: 0,
      onlineEstimate: (payload as any).item.estimatedBasePrice ?? undefined,
      finalOffer: null
    }
  });
  return mapDbCaseToApi(created as any);
}

export async function createCaseMinimal(payload: any) {
  const created = await prisma.buybackCase.create({
    data: {
      caseNumber: `DEC-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'pending',
      customer: { create: payload?.customer ?? { firstName: 'Client', lastName: 'Magasin' } },
      articleType: payload?.item?.articleType ?? 'bike',
      finalOffer: null
    }
  });
  return mapDbCaseToApi(created as any);
}

export async function updateCase(caseNumber: string, partial: Partial<BuybackCase>) {
  const c = await prisma.buybackCase.findUnique({ where: { caseNumber }, include: { scoreResult: true, preDiagnostic: true } });
  if (!c) throw new ApiError(404, 'Dossier introuvable');

  const data: any = {};
  if (partial.status) data.status = partial.status;
  if (typeof partial.finalOffer !== 'undefined') data.finalOffer = partial.finalOffer;
  if (typeof partial.customerScore !== 'undefined') data.customerScore = partial.customerScore as any;
  if (typeof partial.onlineEstimate !== 'undefined') data.onlineEstimate = partial.onlineEstimate as any;

  // persist scoring if provided
  if ((partial as any).scoring) {
    const s = (partial as any).scoring;
    await prisma.scoreResult.upsert({
      where: { caseId: c.id },
      update: {
        technicianScore: s.technicianScore,
        decision: s.decision,
        onlineEstimate: s.onlineEstimate ?? null,
        finalOffer: s.finalOffer,
        gapPercent: s.gapPercent ?? null,
        categoryScoresJson: JSON.stringify(s.categoryScores ?? {}),
        blockingReasonsJson: JSON.stringify(s.blockingReasons ?? []),
        repairCostsJson: JSON.stringify(s.repairCosts ?? []),
        priceBreakdownJson: JSON.stringify(s.priceBreakdown ?? {}),
        explanationsJson: JSON.stringify(s.explanations ?? [])
      },
      create: {
        caseId: c.id,
        customerScore: s.customerScore ?? null,
        technicianScore: s.technicianScore,
        decision: s.decision,
        onlineEstimate: s.onlineEstimate ?? null,
        finalOffer: s.finalOffer,
        gapPercent: s.gapPercent ?? null,
        categoryScoresJson: JSON.stringify(s.categoryScores ?? {}),
        blockingReasonsJson: JSON.stringify(s.blockingReasons ?? []),
        repairCostsJson: JSON.stringify(s.repairCosts ?? []),
        priceBreakdownJson: JSON.stringify(s.priceBreakdown ?? {}),
        explanationsJson: JSON.stringify(s.explanations ?? [])
      }
    });
  }

  const updated = await prisma.buybackCase.update({ where: { caseNumber }, data });
  return mapDbCaseToApi(await prisma.buybackCase.findUnique({ where: { caseNumber }, include: { customer: true, preDiagnostic: true, diagnosis: true, scoreResult: true, decision: true } }));
}

export async function setCaseStatus(caseNumber: string, status: BuybackCase['status']) {
  const c = await prisma.buybackCase.findUnique({ where: { caseNumber } });
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  const updated = await prisma.buybackCase.update({ where: { caseNumber }, data: { status } });
  return mapDbCaseToApi(await prisma.buybackCase.findUnique({ where: { caseNumber }, include: { customer: true, preDiagnostic: true, diagnosis: true, scoreResult: true, decision: true } }));
}

export async function setFinalOffer(caseNumber: string, offer: number | null) {
  const c = await prisma.buybackCase.findUnique({ where: { caseNumber } });
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  await prisma.buybackCase.update({ where: { caseNumber }, data: { finalOffer: offer } });
  return mapDbCaseToApi(await prisma.buybackCase.findUnique({ where: { caseNumber }, include: { customer: true, preDiagnostic: true, diagnosis: true, scoreResult: true, decision: true } }));
}

export async function setRefusal(caseNumber: string, reasons: string[]) {
  const c = await prisma.buybackCase.findUnique({ where: { caseNumber } });
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  await prisma.decision.upsert({
    where: { caseId: c.id },
    update: {
      status: 'refused',
      finalOffer: 0,
      refusalReasonsJson: JSON.stringify(reasons),
      completedAt: new Date()
    },
    create: {
      caseId: c.id,
      status: 'refused',
      finalOffer: 0,
      refusalReasonsJson: JSON.stringify(reasons),
      completedAt: new Date()
    }
  });
  await prisma.buybackCase.update({ where: { caseNumber }, data: { status: 'refused', finalOffer: 0 } });
  const updated = await prisma.buybackCase.findUnique({ where: { caseNumber }, include: { customer: true, preDiagnostic: true, diagnosis: true, scoreResult: true, decision: true } });
  return mapDbCaseToApi(updated);
}
