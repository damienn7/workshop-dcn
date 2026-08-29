import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../../app';
import prisma from '../../db/prisma';
import { createBuybackCase } from '../../test/factories';

type DiagnosisSections = {
  identification?: Record<string, unknown> | null;
  frameFork?: Record<string, unknown> | null;
  brakes?: Record<string, unknown> | null;
  transmission?: Record<string, unknown> | null;
  wheelsTires?: Record<string, unknown> | null;
  finishing?: Record<string, unknown> | null;
};

const completeDiagnosis: Required<DiagnosisSections> = {
  identification: {
    articleType: 'bike',
    category: 'vtt',
    brand: 'Rockrider',
    model: '520',
    year: 2020,
    frameSize: 'M',
    serialNumber: '1234567890',
    estimatedBasePrice: 200
  },
  frameFork: {
    generalCondition: 'excellent',
    shockDeformation: 'no',
    fork: 'excellent'
  },
  brakes: {
    frontEfficiency: 'correct',
    rearEfficiency: 'correct',
    padsWear: 'good'
  },
  transmission: {
    chain: 'good',
    derailleur: 'good',
    bottomBracket: 'good'
  },
  wheelsTires: {
    rims: 'good',
    tires: 'good',
    hubs: 'good'
  },
  finishing: {
    saddle: 'good',
    handlebarDirection: 'good',
    cleanliness: 'clean'
  }
};

function stringifySection(section: Record<string, unknown> | null | undefined) {
  return section ? JSON.stringify(section) : null;
}

function parseJsonField<T>(value: string | null | undefined): T | null {
  return value ? JSON.parse(value) : null;
}

async function createDiagnosedCase({
  diagnosis = completeDiagnosis,
  estimatedBasePrice = 200,
  onlineEstimate = 200,
  customerScore = 80
}: {
  diagnosis?: DiagnosisSections;
  estimatedBasePrice?: number;
  onlineEstimate?: number;
  customerScore?: number;
} = {}) {
  const created = await createBuybackCase({
    status: 'diagnosis_in_progress',
    withDiagnosis: true,
    estimatedBasePrice,
    onlineEstimate,
    customerScore
  });

  await prisma.diagnosis.update({
    where: { caseId: created.id },
    data: {
      identificationJson: stringifySection(diagnosis.identification),
      frameForkJson: stringifySection(diagnosis.frameFork),
      brakesJson: stringifySection(diagnosis.brakes),
      transmissionJson: stringifySection(diagnosis.transmission),
      wheelsTiresJson: stringifySection(diagnosis.wheelsTires),
      finishingJson: stringifySection(diagnosis.finishing)
    }
  });

  return created;
}

async function createCaseWithScore() {
  const created = await createDiagnosedCase();
  const scoreResponse = await request(app)
    .post(`/api/cases/${created.caseNumber}/score`)
    .expect(200);

  return {
    created,
    score: scoreResponse.body
  };
}

describe('scoring and decision API flows', () => {
  it('calculates and persists a score for a complete diagnosis', async () => {
    const created = await createDiagnosedCase();

    const response = await request(app)
      .post(`/api/cases/${created.caseNumber}/score`)
      .expect(200);

    expect(response.body).toMatchObject({
      customerScore: 80,
      decision: 'accepted',
      onlineEstimate: 200,
      blockingReasons: [],
      repairCosts: []
    });
    expect(response.body.technicianScore).toBeGreaterThanOrEqual(75);
    expect(response.body.finalOffer).toBeGreaterThan(0);

    const persistedScore = await prisma.scoreResult.findUnique({
      where: { caseId: created.id }
    });
    const persistedCase = await prisma.buybackCase.findUnique({
      where: { caseNumber: created.caseNumber }
    });

    expect(persistedScore).toMatchObject({
      customerScore: 80,
      technicianScore: response.body.technicianScore,
      decision: response.body.decision,
      onlineEstimate: 200,
      finalOffer: response.body.finalOffer
    });
    expect(parseJsonField(persistedScore?.categoryScoresJson)).toEqual(response.body.categoryScores);
    expect(parseJsonField(persistedScore?.priceBreakdownJson)).toEqual(response.body.priceBreakdown);
    expect(persistedCase?.finalOffer).toBe(response.body.finalOffer);
  });

  it('returns 404 when scoring an unknown case', async () => {
    const response = await request(app)
      .post('/api/cases/UNKNOWN/score')
      .expect(404);

    expect(response.body.message).toBe('Dossier introuvable');
  });

  it('[DEFECT] rejects scoring when diagnosis sections are incomplete', async () => {
    const created = await createDiagnosedCase({
      diagnosis: {
        identification: completeDiagnosis.identification,
        frameFork: null,
        brakes: null,
        transmission: null,
        wheelsTires: null,
        finishing: null
      }
    });

    const response = await request(app)
      .post(`/api/cases/${created.caseNumber}/score`);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/diagnostic incomplet/i);
  });

  it('persists an accepted decision using the suggested offer', async () => {
    const { created, score } = await createCaseWithScore();

    const response = await request(app)
      .post(`/api/cases/${created.caseNumber}/decision/accept`)
      .send({ finalOffer: score.finalOffer })
      .expect(200);

    expect(response.body).toEqual({
      message: 'Accepté',
      finalOffer: score.finalOffer
    });

    const decision = await prisma.decision.findUnique({
      where: { caseId: created.id }
    });
    const persistedCase = await prisma.buybackCase.findUnique({
      where: { caseNumber: created.caseNumber }
    });

    expect(decision).toMatchObject({
      status: 'accepted',
      finalOffer: score.finalOffer,
      manualAdjustment: false,
      adjustmentReason: null
    });
    expect(decision?.completedAt).toBeInstanceOf(Date);
    expect(persistedCase).toMatchObject({
      status: 'accepted',
      finalOffer: score.finalOffer
    });
  });

  it('rejects acceptance when the score has not been calculated', async () => {
    const created = await createDiagnosedCase();

    const response = await request(app)
      .post(`/api/cases/${created.caseNumber}/decision/accept`)
      .send({ finalOffer: 100 })
      .expect(400);

    expect(response.body.message).toBe('Scoring manquant');
  });

  it('persists a manual adjustment inside the authorized range', async () => {
    const { created, score } = await createCaseWithScore();
    const adjustedOffer = score.finalOffer + 5;
    const adjustmentReason = 'Alignement avec l etat observe en magasin';

    const response = await request(app)
      .post(`/api/cases/${created.caseNumber}/decision/accept`)
      .send({
        manualAdjustment: true,
        finalOffer: adjustedOffer,
        adjustmentReason
      })
      .expect(200);

    expect(response.body.finalOffer).toBe(adjustedOffer);

    const decision = await prisma.decision.findUnique({
      where: { caseId: created.id }
    });
    const persistedCase = await prisma.buybackCase.findUnique({
      where: { caseNumber: created.caseNumber }
    });

    expect(decision).toMatchObject({
      status: 'accepted',
      finalOffer: adjustedOffer,
      manualAdjustment: true,
      adjustmentReason
    });
    expect(persistedCase?.finalOffer).toBe(adjustedOffer);
  });

  it('rejects a manual adjustment outside the authorized range', async () => {
    const { created, score } = await createCaseWithScore();

    const response = await request(app)
      .post(`/api/cases/${created.caseNumber}/decision/accept`)
      .send({
        manualAdjustment: true,
        finalOffer: score.finalOffer + 100,
        adjustmentReason: 'Ajustement trop important'
      })
      .expect(400);

    expect(response.body.message).toBe('Ajustement hors fourchette autorisée');
    expect(response.body.details[0]).toMatch(/entre/);
  });

  it('persists a refusal decision with reasons and zero final offer', async () => {
    const created = await createDiagnosedCase();
    const reasons = ['Client refuse le prix propose', 'Reprise non rentable'];

    const response = await request(app)
      .post(`/api/cases/${created.caseNumber}/decision/refuse`)
      .send({ reasons })
      .expect(200);

    expect(response.body.message).toBe('Refusé');

    const decision = await prisma.decision.findUnique({
      where: { caseId: created.id }
    });
    const persistedCase = await prisma.buybackCase.findUnique({
      where: { caseNumber: created.caseNumber }
    });

    expect(decision).toMatchObject({
      status: 'refused',
      finalOffer: 0
    });
    expect(parseJsonField(decision?.refusalReasonsJson)).toEqual(reasons);
    expect(persistedCase).toMatchObject({
      status: 'refused',
      finalOffer: 0
    });
  });

  it('[DEFECT] returns refusal reasons and persists alternatives for later display', async () => {
    const created = await createDiagnosedCase();
    const reasons = ['Cadre fissure'];
    const alternatives = ['Proposer recyclage atelier', 'Diriger vers reparation'];

    const response = await request(app)
      .post(`/api/cases/${created.caseNumber}/decision/refuse`)
      .send({ reasons, alternatives })
      .expect(200);

    const decision = await prisma.decision.findUnique({
      where: { caseId: created.id }
    });
    const observed = {
      responseReasons: response.body.reasons,
      persistedAlternatives: parseJsonField<string[]>(decision?.alternativesJson) ?? []
    };

    expect(observed).toEqual({
      responseReasons: reasons,
      persistedAlternatives: alternatives
    });
  });
});
