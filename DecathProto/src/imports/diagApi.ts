import { apiGet, apiPost, apiPut } from './api';
import type { BuybackCase, CaseListItem, ScoreResult } from './api.types';

export const diagApi = {
  listCases(): Promise<CaseListItem[]> {
    return apiGet<CaseListItem[]>('/api/cases');
  },

  getCase(caseNumber: string): Promise<BuybackCase> {
    return apiGet<BuybackCase>(`/api/cases/${caseNumber}`);
  },

  createCase(payload: unknown): Promise<BuybackCase> {
    return apiPost<BuybackCase>('/api/cases', payload);
  },

  startDiagnosis(caseNumber: string): Promise<unknown> {
    return apiPost(`/api/cases/${caseNumber}/diagnosis/start`);
  },

  getDiagnosis(caseNumber: string): Promise<unknown> {
    return apiGet(`/api/cases/${caseNumber}/diagnosis`);
  },

  saveIdentification(caseNumber: string, payload: unknown): Promise<unknown> {
    return apiPut(`/api/cases/${caseNumber}/diagnosis/identification`, payload);
  },

  saveFrameFork(caseNumber: string, payload: unknown): Promise<unknown> {
    return apiPut(`/api/cases/${caseNumber}/diagnosis/frame-fork`, payload);
  },

  saveBrakes(caseNumber: string, payload: unknown): Promise<unknown> {
    return apiPut(`/api/cases/${caseNumber}/diagnosis/brakes`, payload);
  },

  saveTransmission(caseNumber: string, payload: unknown): Promise<unknown> {
    return apiPut(`/api/cases/${caseNumber}/diagnosis/transmission`, payload);
  },

  saveWheelsTires(caseNumber: string, payload: unknown): Promise<unknown> {
    return apiPut(`/api/cases/${caseNumber}/diagnosis/wheels-tires`, payload);
  },

  saveFinishing(caseNumber: string, payload: unknown): Promise<unknown> {
    return apiPut(`/api/cases/${caseNumber}/diagnosis/finishing`, payload);
  },

  calculateScore(caseNumber: string): Promise<ScoreResult> {
    return apiPost<ScoreResult>(`/api/cases/${caseNumber}/score`);
  },

  getScore(caseNumber: string): Promise<ScoreResult> {
    return apiGet<ScoreResult>(`/api/cases/${caseNumber}/score`);
  },

  acceptDecision(caseNumber: string, payload: { finalOffer: number; manualAdjustment: boolean; adjustmentReason: string | null; }) {
    return apiPost(`/api/cases/${caseNumber}/decision/accept`, payload);
  },

  refuseDecision(caseNumber: string, payload: { reasons: string[]; alternatives: string[]; }) {
    return apiPost(`/api/cases/${caseNumber}/decision/refuse`, payload);
  }
};

export default diagApi;
