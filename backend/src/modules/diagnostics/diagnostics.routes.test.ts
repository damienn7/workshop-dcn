import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../../app.js';
import prisma from '../../db/prisma.js';
import { createBuybackCase } from '../../test/factories.js';

function parseJsonField<T>(value: string | null): T | null {
  return value ? JSON.parse(value) : null;
}

describe('diagnosis API persistence flow', () => {
  it('returns 404 when starting diagnosis for an unknown case', async () => {
    const response = await request(app)
      .post('/api/cases/UNKNOWN/diagnosis/start')
      .expect(404);

    expect(response.body.message).toBe('Dossier introuvable');
  });

  it('starts a diagnosis and marks the case as in progress', async () => {
    const created = await createBuybackCase();

    const response = await request(app)
      .post(`/api/cases/${created.caseNumber}/diagnosis/start`)
      .expect(200);

    expect(response.body).toEqual({
      identification: null,
      frameFork: null,
      brakes: null,
      transmission: null,
      wheelsTires: null,
      finishing: null
    });

    const persisted = await prisma.buybackCase.findUnique({
      where: { caseNumber: created.caseNumber },
      include: { diagnosis: true }
    });

    expect(persisted?.status).toBe('diagnosis_in_progress');
    expect(persisted?.diagnosis).not.toBeNull();
  });

  it('persists identification and mirrors bike fields on the case', async () => {
    const created = await createBuybackCase({ withDiagnosis: true });
    const payload = {
      articleType: 'bike',
      category: 'route_gravel',
      brand: 'Triban',
      model: 'RC 120',
      year: 2022,
      frameSize: 'L',
      serialNumber: '123456789012',
      estimatedBasePrice: 350,
      firstLookState: 'good'
    };

    const response = await request(app)
      .put(`/api/cases/${created.caseNumber}/diagnosis/identification`)
      .send(payload)
      .expect(200);

    expect(response.body).toEqual(payload);

    const persisted = await prisma.buybackCase.findUnique({
      where: { caseNumber: created.caseNumber },
      include: { diagnosis: true }
    });

    expect(persisted?.brand).toBe(payload.brand);
    expect(persisted?.model).toBe(payload.model);
    expect(persisted?.year).toBe(payload.year);
    expect(persisted?.frameSize).toBe(payload.frameSize);
    expect(persisted?.serialNumber).toBe(payload.serialNumber);
    expect(persisted?.estimatedBasePrice).toBe(payload.estimatedBasePrice);
    expect(parseJsonField(persisted?.diagnosis?.identificationJson ?? null)).toEqual(payload);
  });

  it('rejects section saves when diagnosis has not been started', async () => {
    const created = await createBuybackCase();

    const response = await request(app)
      .put(`/api/cases/${created.caseNumber}/diagnosis/frame-fork`)
      .send({
        generalCondition: 'good',
        fork: 'functional'
      })
      .expect(400);

    expect(response.body.message).toBe('Diagnostic non démarré');
  });

  it.each([
    {
      label: 'frame/fork',
      endpoint: 'frame-fork',
      dbField: 'frameForkJson',
      payload: {
        generalCondition: 'good',
        impacts: 'light',
        shockDeformation: 'no',
        fork: 'functional',
        wear: 'good'
      }
    },
    {
      label: 'brakes',
      endpoint: 'brakes',
      dbField: 'brakesJson',
      payload: {
        type: 'v_brake_pads',
        frontEfficiency: 'correct',
        rearEfficiency: 'correct',
        padsWear: 'good'
      }
    },
    {
      label: 'transmission',
      endpoint: 'transmission',
      dbField: 'transmissionJson',
      payload: {
        chain: 'dry',
        derailleur: 'medium',
        bottomBracket: 'good'
      }
    },
    {
      label: 'wheels/tires',
      endpoint: 'wheels-tires',
      dbField: 'wheelsTiresJson',
      payload: {
        rims: 'medium',
        tires: 'good',
        hubs: 'fluid'
      }
    },
    {
      label: 'finishing',
      endpoint: 'finishing',
      dbField: 'finishingJson',
      payload: {
        saddle: 'good',
        handlebarDirection: 'good',
        cleanliness: 'cleaning_needed',
        observations: 'Needs cleaning'
      }
    }
  ])('persists the $label diagnosis section', async ({ endpoint, dbField, payload }) => {
    const created = await createBuybackCase({ withDiagnosis: true });

    const response = await request(app)
      .put(`/api/cases/${created.caseNumber}/diagnosis/${endpoint}`)
      .send(payload)
      .expect(200);

    expect(response.body).toEqual(payload);

    const diagnosis = await prisma.diagnosis.findUnique({
      where: { caseId: created.id }
    });

    expect(parseJsonField((diagnosis as any)?.[dbField] ?? null)).toEqual(payload);
  });
});
