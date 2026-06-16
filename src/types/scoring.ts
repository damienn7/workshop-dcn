import { Decision } from '../domain/scoringEngine';

export interface ScoringResult {
  base: number;
  finalOffer: number;
  repairCosts: number;
  cleaningCosts: number;
  score: number;
  decision: Decision;
  reasons: string[];
}
