import { ApiError } from '../../shared/ApiError.js';
import prisma from '../../db/prisma.js';
import {
  IdentificationSchema,
  FrameForkSchema,
  BrakesSchema,
  TransmissionSchema,
  WheelsTiresSchema,
  FinishingSchema
} from './diagnostics.schemas.js';

async function ensureCaseExists(caseNumber: string) {
  const c = await prisma.buybackCase.findUnique({ where: { caseNumber } });
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  return c;
}

export async function startDiagnosis(caseNumber: string) {
  const c = await ensureCaseExists(caseNumber);
  // upsert diagnosis row
  await prisma.diagnosis.upsert({
    where: { caseId: c.id },
    update: { startedAt: new Date() },
    create: { caseId: c.id }
  });
  await prisma.buybackCase.update({ where: { caseNumber }, data: { status: 'diagnosis_in_progress' } });
  const diag = await prisma.diagnosis.findUnique({ where: { caseId: c.id } });
  return {
    diagnosis: {
      identification: diag?.identificationJson ? JSON.parse(diag.identificationJson) : null,
      frameFork: diag?.frameForkJson ? JSON.parse(diag.frameForkJson) : null,
      brakes: diag?.brakesJson ? JSON.parse(diag.brakesJson) : null,
      transmission: diag?.transmissionJson ? JSON.parse(diag.transmissionJson) : null,
      wheelsTires: diag?.wheelsTiresJson ? JSON.parse(diag.wheelsTiresJson) : null,
      finishing: diag?.finishingJson ? JSON.parse(diag.finishingJson) : null
    }
  };
}

export async function saveIdentification(caseNumber: string, payload: unknown) {
  const parsed = IdentificationSchema.safeParse(payload);
  if (!parsed.success) throw new ApiError(400, 'Données identification invalides', parsed.error.errors.map(e => e.message));

  const data = parsed.data;
  if (!data.articleType) throw new ApiError(400, 'Article obligatoire');
  if (data.articleType === 'bike' && !data.category) throw new ApiError(400, 'Catégorie obligatoire pour les vélos');
  if (!data.brand || !data.model || !data.year || !data.frameSize) throw new ApiError(400, 'Champs d\'identification manquants');
  if (!data.serialNumber || data.serialNumber.replace(/\D/g, '').length < 10) {
    throw new ApiError(400, "Il faut un numéro de série de 10 chiffres minimum");
  }
  if (!data.estimatedBasePrice || data.estimatedBasePrice <= 0) throw new ApiError(400, 'Prix estimé doit être supérieur à 0');

  const c = await ensureCaseExists(caseNumber);
  const diag = await prisma.diagnosis.findUnique({ where: { caseId: c.id } });
  if (!diag) throw new ApiError(400, 'Diagnostic non démarré');

  // persist identification
  await prisma.diagnosis.update({ where: { caseId: c.id }, data: { identificationJson: JSON.stringify(data) } });

  // also update basic item fields on the case
  await prisma.buybackCase.update({ where: { caseNumber }, data: {
    brand: data.brand,
    model: data.model,
    year: data.year,
    frameSize: data.frameSize,
    serialNumber: data.serialNumber,
    estimatedBasePrice: data.estimatedBasePrice
  }});

  return data;
}

async function saveStep(caseNumber: string, key: string, schema: any, payload: unknown) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new ApiError(400, 'Données invalides', parsed.error.errors.map((e: any) => e.message));
  const c = await ensureCaseExists(caseNumber);
  const diag = await prisma.diagnosis.findUnique({ where: { caseId: c.id } });
  if (!diag) throw new ApiError(400, 'Diagnostic non démarré');

  const fieldMap: any = {
    frameFork: 'frameForkJson',
    brakes: 'brakesJson',
    transmission: 'transmissionJson',
    wheelsTires: 'wheelsTiresJson',
    finishing: 'finishingJson'
  };

  const field = fieldMap[key];
  if (!field) throw new ApiError(500, 'Étape inconnue');

  await prisma.diagnosis.update({ where: { caseId: c.id }, data: { [field]: JSON.stringify(parsed.data) } });
  return parsed.data;
}

export function saveFrameFork(caseNumber: string, payload: unknown) {
  return saveStep(caseNumber, 'frameFork', FrameForkSchema, payload);
}

export function saveBrakes(caseNumber: string, payload: unknown) {
  return saveStep(caseNumber, 'brakes', BrakesSchema, payload);
}

export function saveTransmission(caseNumber: string, payload: unknown) {
  return saveStep(caseNumber, 'transmission', TransmissionSchema, payload);
}

export function saveWheelsTires(caseNumber: string, payload: unknown) {
  return saveStep(caseNumber, 'wheelsTires', WheelsTiresSchema, payload);
}

export function saveFinishing(caseNumber: string, payload: unknown) {
  return saveStep(caseNumber, 'finishing', FinishingSchema, payload);
}

export async function getDiagnosis(caseNumber: string) {
  const c = await prisma.buybackCase.findUnique({ where: { caseNumber }, include: { diagnosis: true } });
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  if (!c.diagnosis) throw new ApiError(400, 'Diagnostic non démarré');
  const d = c.diagnosis;
  return {
    identification: d.identificationJson ? JSON.parse(d.identificationJson) : null,
    frameFork: d.frameForkJson ? JSON.parse(d.frameForkJson) : null,
    brakes: d.brakesJson ? JSON.parse(d.brakesJson) : null,
    transmission: d.transmissionJson ? JSON.parse(d.transmissionJson) : null,
    wheelsTires: d.wheelsTiresJson ? JSON.parse(d.wheelsTiresJson) : null,
    finishing: d.finishingJson ? JSON.parse(d.finishingJson) : null
  };
}
