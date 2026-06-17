import { ApiError } from '../../shared/ApiError';
import { getCaseByNumber, updateCase, setCaseStatus } from '../cases/cases.service';
import {
  IdentificationSchema,
  FrameForkSchema,
  BrakesSchema,
  TransmissionSchema,
  WheelsTiresSchema,
  FinishingSchema
} from './diagnostics.schemas';

export function startDiagnosis(caseNumber: string) {
  const c = getCaseByNumber(caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  c.status = 'diagnosis_in_progress';
  c.startedAt = new Date().toISOString();
  c.diagnosis = {
    identification: null,
    frameFork: null,
    brakes: null,
    transmission: null,
    wheelsTires: null,
    finishing: null
  };
  return c;
}

export function saveIdentification(caseNumber: string, payload: unknown) {
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

  const c = getCaseByNumber(caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  if (c.status !== 'diagnosis_in_progress') throw new ApiError(400, 'Diagnostic non démarré');

  c.diagnosis = c.diagnosis || {};
  c.diagnosis.identification = data;
  return c.diagnosis;
}

function saveStep(caseNumber: string, key: string, schema: any, payload: unknown) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new ApiError(400, 'Données invalides', parsed.error.errors.map((e: any) => e.message));
  const c = getCaseByNumber(caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  if (c.status !== 'diagnosis_in_progress') throw new ApiError(400, 'Diagnostic non démarré');
  c.diagnosis = c.diagnosis || {};
  (c.diagnosis as any)[key] = parsed.data;
  return (c.diagnosis as any)[key];
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

export function getDiagnosis(caseNumber: string) {
  const c = getCaseByNumber(caseNumber);
  if (!c) throw new ApiError(404, 'Dossier introuvable');
  if (!c.diagnosis) throw new ApiError(400, 'Diagnostic non démarré');
  return c.diagnosis;
}
